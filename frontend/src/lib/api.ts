import { auth, db, storage } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const formatDoc = (d: any) => ({ _id: d.id, ...d.data() });
const formatDocs = (qs: any) => qs.docs.map(formatDoc);

export const authAPI = {
  register: async (data: any) => ({ data: { success: true } }),
  login: async (data: any) => ({ data: { success: true } }),
  verifyOtp: async (data: any) => ({ data: { success: true } }),
  getMe: async () => ({ data: { user: {} } }),
  updateProfile: async (data: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    await updateDoc(doc(db, 'users', user.uid), data);
    return { data: { success: true } };
  },
};

export const donationAPI = {
  create: async (fd: FormData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    
    const data: any = {};
    const images: File[] = [];
    fd.forEach((value, key) => {
      if (key === 'images') {
        images.push(value as File);
      } else if (key.startsWith('pickupLocation.')) {
        if (!data.pickupLocation) data.pickupLocation = {};
        data.pickupLocation[key.split('.')[1]] = value;
      } else {
        data[key] = value;
      }
    });

    // Compress images client-side and store as Base64 in Firestore (Vercel-compatible, no backend needed)
    const compressImageToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const img = new window.Image();
          img.src = reader.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = reject;
        };
        reader.onerror = reject;
      });
    };

    let imageUrls: string[] = [];
    if (images.length > 0) {
      imageUrls = await Promise.all(images.map(compressImageToBase64));
    }

    data.images = imageUrls;
    data.status = 'pending';
    data.donorId = user.uid;
    // Store as ISO string for simpler querying without complex timestamps
    data.createdAt = new Date().toISOString(); 

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    data.donor = userDoc.exists() ? { 
      name: userDoc.data().name, 
      organization: userDoc.data().organization,
      phone: userDoc.data().phone || ''
    } : {};

    const docRef = await addDoc(collection(db, 'donations'), data);
    return { data: { success: true, donation: { _id: docRef.id, ...data } } };
  },
  
  getMyDonations: async () => {
    const user = auth.currentUser;
    if (!user) return { data: { donations: [] } };
    const q = query(collection(db, 'donations'), where('donorId', '==', user.uid));
    const snapshot = await getDocs(q);
    const results = formatDocs(snapshot).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { data: { donations: results } };
  },
  
  getAll: async (params?: any) => {
    // Simple fetch all and filter client-side to avoid needing composite indexes right away
    const snapshot = await getDocs(collection(db, 'donations'));
    let results = formatDocs(snapshot);
    if (params?.status) results = results.filter((d: any) => d.status === params.status);
    if (params?.category) results = results.filter((d: any) => d.category === params.category);
    // Sort by newest first
    results.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { data: { donations: results } };
  },
  
  getById: async (id: string) => {
    const d = await getDoc(doc(db, 'donations', id));
    return { data: { donation: d.exists() ? formatDoc(d) : null } };
  },
  
  updateStatus: async (id: string, data: any) => {
    await updateDoc(doc(db, 'donations', id), data);
    return { data: { success: true } };
  },
  
  delete: async (id: string) => {
    await deleteDoc(doc(db, 'donations', id));
    return { data: { success: true } };
  }
};

export const ngoAPI = {
  getDashboard: async () => {
    const user = auth.currentUser;
    if (!user) return { data: { stats: null } };
    
    // Recent Assigned Donations
    const qDonations = query(collection(db, 'donations'), where('ngoId', '==', user.uid));
    const snapDonations = await getDocs(qDonations);
    const myDonations = formatDocs(snapDonations).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Inventory
    const qInv = query(collection(db, 'inventory'), where('ngoId', '==', user.uid));
    const snapInv = await getDocs(qInv);
    const inventory = formatDocs(snapInv);
    const inventoryItems = inventory.reduce((sum: number, item: any) => sum + (parseInt(item.remainingQuantity) || 0), 0);

    // Volunteers
    const qVol = query(collection(db, 'users'), where('role', '==', 'volunteer'));
    const snapVol = await getDocs(qVol);
    
    // Pending Nearby
    const qPending = query(collection(db, 'donations'), where('status', '==', 'pending'));
    const snapPending = await getDocs(qPending);
    
    return { 
      data: { 
        stats: { 
          totalDonations: myDonations.length, 
          volunteerCount: snapVol.size, 
          pendingNearby: snapPending.size,
          inventoryItems,
          accepted: myDonations.filter((d: any) => ['accepted', 'assigned', 'picked_up'].includes(d.status)).length,
          completed: myDonations.filter((d: any) => d.status === 'completed' || d.status === 'delivered').length
        },
        recentDonations: myDonations.slice(0, 5),
        inventory: inventory.slice(0, 5)
      } 
    };
  },
  getNearbyDonations: async (params?: any) => {
    // Return all donations so the NGO can see pending ones and the ones they accepted
    return donationAPI.getAll(params);
  },
  assignVolunteer: async (data: any) => {
    // Now sends a request instead of direct assignment
    await updateDoc(doc(db, 'donations', data.donationId), {
      requestedVolunteerId: data.volunteerId,
      volunteerRequestStatus: 'pending'
    });
    return { data: { success: true } };
  },
  getInventory: async () => {
    const user = auth.currentUser;
    if (!user) return { data: { inventory: [] } };
    const q = query(collection(db, 'inventory'), where('ngoId', '==', user.uid));
    const snapshot = await getDocs(q);
    return { data: { inventory: formatDocs(snapshot) } };
  },
  addInventory: async (data: any) => {
    const user = auth.currentUser;
    if (!user) return { data: { success: false } };
    await addDoc(collection(db, 'inventory'), { ...data, ngoId: user.uid, addedAt: new Date().toISOString() });
    return { data: { success: true } };
  },
  getImpactReport: async () => {
    const user = auth.currentUser;
    if (!user) return { data: { stats: null } };
    
    const q = query(collection(db, 'donations'), where('ngoId', '==', user.uid));
    const snapshot = await getDocs(q);
    const donations = formatDocs(snapshot);
    
    const completed = donations.filter((d: any) => d.status === 'completed' || d.status === 'delivered');
    const totalDonations = donations.length;
    
    const categoryMap: any = {};
    const monthlyMap: any = {};
    let peopleServed = 0;

    donations.forEach((d: any) => {
      categoryMap[d.category] = (categoryMap[d.category] || 0) + 1;
      
      let date = new Date(d.createdAt);
      if (d.createdAt?.seconds) date = new Date(d.createdAt.seconds * 1000);
      if (!isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + 1;
      }
      
      if (d.category === 'food') {
         peopleServed += (parseInt(d.quantity) || 1) * 5;
      } else {
         peopleServed += (parseInt(d.quantity) || 1);
      }
    });

    return { 
      data: { 
        stats: { 
          totalDonations, 
          completedDonations: completed.length, 
          peopleServed,
          categoryBreakdown: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
          monthlyTrend: Object.entries(monthlyMap).sort((a: any, b: any) => a[0].localeCompare(b[0])).map(([name, value]) => ({ name, value }))
        } 
      } 
    };
  },
};

export const volunteerAPI = {
  respondToRequest: async (donationId: string, accept: boolean) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");
    
    if (accept) {
      const volDoc = await getDoc(doc(db, 'users', user.uid));
      const volData = volDoc.exists() ? volDoc.data() : null;
      
      await updateDoc(doc(db, 'donations', donationId), {
        volunteerId: user.uid,
        volunteerName: volData?.name || 'Volunteer',
        volunteerPhone: volData?.phone || 'Not provided',
        status: 'assigned',
        volunteerRequestStatus: 'accepted',
        assignedAt: new Date().toISOString()
      });
    } else {
      await updateDoc(doc(db, 'donations', donationId), {
        requestedVolunteerId: null,
        volunteerRequestStatus: 'declined'
      });
    }
    return { data: { success: true } };
  },
  getDashboard: async () => {
    const user = auth.currentUser;
    if (!user) return { data: { activePickups: [], recentDeliveries: [], stats: {} } };
    
    const q1 = query(collection(db, 'donations'), where('volunteerId', '==', user.uid));
    const snapshot1 = await getDocs(q1);
    const assigned = formatDocs(snapshot1);
    
    const q2 = query(collection(db, 'donations'), where('requestedVolunteerId', '==', user.uid));
    const snapshot2 = await getDocs(q2);
    
    // Also try without where clause just to debug if it's there
    const allDocs = await getDocs(collection(db, 'donations'));
    const allRequested = formatDocs(allDocs).filter((d: any) => d.requestedVolunteerId === user.uid);
    const requested = allRequested.filter((d: any) => d.volunteerRequestStatus === 'pending');

    const activePickups = assigned.filter((d: any) => d.status === 'assigned' || d.status === 'picked_up');
    const recentDeliveries = assigned.filter((d: any) => d.status === 'delivered' || d.status === 'completed');
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    // Calculate stats expected by UI
    const statsObj = {
      assigned: assigned.filter((d: any) => d.status === 'assigned').length,
      pickedUp: assigned.filter((d: any) => d.status === 'picked_up').length,
      completed: recentDeliveries.length,
      points: userData.volunteerPoints || 0
    };
    
    return { data: { activePickups, pendingRequests: requested, recentDeliveries, stats: statsObj } };
  },
  updatePickup: async (id: string, fd: FormData) => {
    const status = fd.get('status') || 'picked_up';
    await updateDoc(doc(db, 'donations', id), { status });
    return { data: { success: true } };
  },
  getHistory: async () => {
    const user = auth.currentUser;
    if (!user) return { data: { history: [] } };
    const q = query(collection(db, 'donations'), where('volunteerId', '==', user.uid));
    const snapshot = await getDocs(q);
    const history = formatDocs(snapshot).filter((d: any) => d.status === 'delivered' || d.status === 'completed');
    return { data: { history } };
  },
  getLeaderboard: async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'volunteer'));
    const snapshot = await getDocs(q);
    const volunteers = formatDocs(snapshot).sort((a: any, b: any) => (b.volunteerPoints || 0) - (a.volunteerPoints || 0));
    return { data: { volunteers } };
  },
};

export const adminAPI = {
  getStats: async () => {
    const users = await getDocs(collection(db, 'users'));
    const donations = await getDocs(collection(db, 'donations'));
    return { data: { totalUsers: users.size, totalDonations: donations.size } };
  },
  getAllUsers: async (params?: any) => {
    const s = await getDocs(collection(db, 'users'));
    return { data: { users: formatDocs(s) } };
  },
  toggleStatus: async (id: string) => {
    const d = await getDoc(doc(db, 'users', id));
    if (d.exists()) await updateDoc(doc(db, 'users', id), { isActive: !d.data().isActive });
    return { data: { success: true } };
  },
  verifyNgo: async (id: string) => {
    await updateDoc(doc(db, 'users', id), { isVerified: true });
    return { data: { success: true } };
  },
  getAllDonations: async (params?: any) => donationAPI.getAll(params),
};

export const notificationAPI = {
  getAll: async () => ({ data: { notifications: [], unreadCount: 0 } }),
  markAllRead: async () => ({ data: {} }),
  markRead: async (id: string) => ({ data: {} }),
};

export const analyticsAPI = {
  getPlatform: async () => {
    try {
      const [usersSnap, donationsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'donations'))
      ]);
      
      const users = formatDocs(usersSnap);
      const donations = formatDocs(donationsSnap);

      const completed = donations.filter(d => d.status === 'completed' || d.status === 'delivered');
      const pending = donations.filter(d => d.status === 'pending');
      const active = donations.filter(d => ['accepted','assigned','picked_up'].includes(d.status));
      const rejected = donations.filter(d => d.status === 'rejected');

      const userStats = {
        total: users.length,
        donors: users.filter(u => u.role === 'donor').length,
        ngos: users.filter(u => u.role === 'ngo').length,
        volunteers: users.filter(u => u.role === 'volunteer').length
      };

      const donationStats = {
        total: donations.length,
        completed: completed.length,
        pending: pending.length,
        active: active.length,
        rejected: rejected.length
      };

      // Estimate meals saved: each food donation = avg 5 servings * quantity
      const totalMealsSaved = completed
        .filter(d => d.category === 'food' || d.foodType)
        .reduce((acc, d) => acc + (parseInt(d.quantity) || 1) * 5, 0);

      // Category breakdown
      const catMap: Record<string, number> = {};
      donations.forEach(d => {
        const cat = d.category || 'other';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(catMap).map(([_id, count]) => ({ _id, count }));

      // Monthly breakdown (last 12 months)
      const monthlyMap: Record<string, { count: number; completed: number }> = {};
      donations.forEach(d => {
        if (!d.createdAt) return;
        let date: Date;
        if (d.createdAt.toDate) date = d.createdAt.toDate();
        else if (d.createdAt.seconds) date = new Date(d.createdAt.seconds * 1000);
        else date = new Date(d.createdAt);
        if (isNaN(date.getTime())) return;
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!monthlyMap[key]) monthlyMap[key] = { count: 0, completed: 0 };
        monthlyMap[key].count++;
        if (d.status === 'completed' || d.status === 'delivered') monthlyMap[key].completed++;
      });
      const monthly = Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([key, val]) => {
          const [year, month] = key.split('-');
          return { _id: { year: parseInt(year), month: parseInt(month) }, count: val.count, completed: val.completed };
        });

      // 7-day timeline
      const timeline = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        timeline.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          donations: donations.filter(don => {
            if (!don.createdAt) return false;
            let donDate: Date;
            if (don.createdAt.toDate) donDate = don.createdAt.toDate();
            else if (don.createdAt.seconds) donDate = new Date(don.createdAt.seconds * 1000);
            else donDate = new Date(don.createdAt);
            if (isNaN(donDate.getTime())) return false;
            return donDate.toISOString().split('T')[0] === dateStr;
          }).length
        });
      }

      const successRate = donations.length > 0 ? Math.round((completed.length / donations.length) * 100) : 0;

      return {
        data: {
          analytics: {
            users: userStats,
            donations: donationStats,
            timeline,
            // Impact page specific fields
            totalMealsSaved,
            totalDonations: donations.length,
            totalCompleted: completed.length,
            activeNgos: users.filter(u => u.role === 'ngo' && u.isVerified).length,
            activeVolunteers: users.filter(u => u.role === 'volunteer' && u.isVerified).length,
            successRate,
            categoryBreakdown,
            monthly,
          }
        }
      };
    } catch (error) {
      console.error(error);
      return { data: { analytics: null } };
    }
  },
};


export const usersAPI = {
  getVolunteers: async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'volunteer'));
    const s = await getDocs(q);
    return { data: { volunteers: formatDocs(s) } };
  },
  getById: async (id: string) => {
    const d = await getDoc(doc(db, 'users', id));
    return { data: { user: formatDoc(d) } };
  },
};

export default {};
