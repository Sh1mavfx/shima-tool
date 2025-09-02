import React, { useState, useEffect, useMemo } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, getDocs, writeBatch, deleteDoc, collectionGroup } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';


// --- Icon Components (No Changes) ---
const Home = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> );
const CheckSquare = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> );
const LogOut = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> );
const ArrowLeft = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> );
const X = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> );
const MapPin = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> );
const LinkIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg> );
const Clipboard = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg> );
const Shield = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> );
const Edit = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> );
const PlusCircle = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> );
const Trash2 = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> );
const User = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> );
const Smartphone = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> );
const Ban = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>);
const Share2 = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>);


// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyBDXaOWBwJ2-go5e7wGV-ovD4S3Et-E2GY",
  authDomain: "shima-tool.firebaseapp.com",
  projectId: "shima-tool",
  storageBucket: "shima-tool.firebasestorage.app",
  messagingSenderId: "1047021803924",
  appId: "1:1047021803924:web:ed63eb1dff81707d8dd781",
  measurementId: "G-9GE47W77ZR"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Dynamic Collection Path Helpers ---
const getCustomerCollectionPath = (staffId) => `artifacts/${appId}/staffs/${staffId}/customers`;
const getCustomerDocPath = (staffId, customerId) => doc(db, getCustomerCollectionPath(staffId), customerId);
const storeCollectionPath = `artifacts/${appId}/public/data/stores`;
const sharedListsCollectionPath = `sharedLists`;


// --- Constant Data (No Changes) ---
const idTypes = ["運転免許証", "マイナンバー", "パスポート", "保険証", "キャッシュカード", "クレジットカード"];
const priceFilterRanges = [
    { label: "無料", min: 0, max: 0 }, { label: "~1000円", min: 1, max: 1000 },
    { label: "~2000円", min: 1001, max: 2000 }, { label: "~3000円", min: 2001, max: 3000 },
    { label: "~5000円", min: 3001, max: 5000 }, { label: "~10000円", min: 5001, max: 10000 }
];
const numberOfPeopleOptions = [
    { label: "~1人", value: 1 }, { label: "~2人", value: 2 },
    { label: "~3人", value: 3 }, { label: "~4人", value: 4 }
];
const lateNightOptions = [
    { label: "不可", value: "不可" }, { label: "23:30~", value: "23:30~" }, { label: "23:45~", value: "23:45~" }
];
const initialStoresData = [
    { id: 'store1', name: 'Club AIR', group: 'AIR GROUP', phoneticName: 'くらぶえあー', openingTime: '19:00', initialTime: 60, closingDay: '日曜日', lateNightOption: '23:30~', initialPriceText: '3000円', initialPriceMin: 3000, initialPriceMax: 3000, backCharge: 'T/C 3000円', requiredIds: ['運転免許証', 'パスポート'], tags: ['#イケメン揃い', '#初回安い'], hosuhosuUrl: '#', mapUrl: '#', staffMemo: '担当Aはシャンパンが好き。', numberOfPeople: 2, locationType: 'walk', contactType: 'phone' },
    { id: 'store2', name: 'TOP DANDY', group: 'groupdandy', phoneticName: 'とっぷだんでぃ', openingTime: '20:00', initialTime: 90, closingDay: '月曜日', lateNightOption: '23:45~', initialPriceText: '5000円', initialPriceMin: 5000, initialPriceMax: 5000, backCharge: 'T/C 4000円', requiredIds: ['運転免許証', 'マイナンバー'], tags: ['#老舗', '#落ち着いた雰囲気'], hosuhosuUrl: '#', mapUrl: '#', staffMemo: '新人Bはトークが上手い。', numberOfPeople: 4, locationType: 'house', contactType: 'phone' },
    { id: 'store3', name: 'Lillion', group: 'Lillion', phoneticName: 'りりおん', openingTime: '18:00', initialTime: 120, closingDay: 'なし', lateNightOption: '不可', initialPriceText: '2000円※', initialPriceMin: 1000, initialPriceMax: 2000, backCharge: 'なし', requiredIds: ['運転免許証'], tags: ['#新規店', '#ワイワイ系'], hosuhosuUrl: '#', mapUrl: '#', staffMemo: 'リーダーCは週末混雑を避けたがる。', numberOfPeople: 3, locationType: 'walk', contactType: 'none' },
];

// --- Main App Component ---
function App() {
    const [page, setPage] = useState('loading');
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [shareId, setShareId] = useState(null);
    
    const [selectedCustomer, setSelectedCustomer] = useState(null); // {id, data, staffId}
    const [editingStore, setEditingStore] = useState(null); // {id, data}
    const [listFilter, setListFilter] = useState('all');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [today, setToday] = useState('');

    useEffect(() => {
        // --- Check for Share ID on initial load ---
        const urlParams = new URLSearchParams(window.location.search);
        const shareIdFromUrl = urlParams.get('shareId');
        if (shareIdFromUrl) {
            setShareId(shareIdFromUrl);
            setPage('share');
            setLoading(false);
            return; // Skip auth logic if viewing a shared page
        }

        // --- Setup Date & Initial Data ---
        const date = new Date();
        const days = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
        setToday(days[date.getDay()]);

        const setupInitialStores = async () => {
             try {
                const storesSnapshot = await getDocs(collection(db, storeCollectionPath));
                if (storesSnapshot.empty) {
                    const batch = writeBatch(db);
                    initialStoresData.forEach(store => {
                        const storeRef = doc(db, storeCollectionPath, store.id);
                        batch.set(storeRef, store);
                    });
                    await batch.commit();
                }
            } catch (setupError) {
                console.error("Error during initial store setup:", setupError);
            }
        };
        setupInitialStores();

        // --- Authentication State Observer ---
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                const idTokenResult = await authUser.getIdTokenResult();
                const userIsAdmin = idTokenResult.claims.admin === true;
                
                setUser(authUser);
                setIsAdmin(userIsAdmin);
                setPage(userIsAdmin ? 'admin' : 'staffCustomers');
                
            } else {
                setUser(null);
                setIsAdmin(false);
                setPage('login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const navigateTo = (targetPage, data = null) => {
        if (targetPage === 'adminCustomerDetail' || targetPage === 'staffCustomerDetail') {
            setSelectedCustomer(data);
        }
        if (targetPage === 'adminStoreEdit') setEditingStore(data);
        if (targetPage === 'list') {
            setSelectedCustomer(data);
        }
        setPage(targetPage);
    };
    
    const handleLogout = async () => { 
        await signOut(auth);
        setSelectedCustomer(null);
        setPage('login'); 
    };

    const renderPage = () => {
        if (loading || page === 'loading') return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
        switch (page) {
            case 'login': return <LoginScreen setError={setError} error={error} />;
            case 'share': return <SharedListScreen shareId={shareId} />;
            case 'list': return <StoreListScreen customer={selectedCustomer} setCustomer={setSelectedCustomer} navigateTo={navigateTo} listFilter={listFilter} setListFilter={setListFilter} today={today} staffId={user.uid} onLogout={handleLogout} />;
            // Admin pages
            case 'admin': return <AdminScreen navigateTo={navigateTo} onLogout={handleLogout} />;
            case 'adminCustomers': return <AdminCustomersScreen navigateTo={navigateTo} />;
            case 'adminCustomerDetail': return <AdminCustomerDetailScreen customer={selectedCustomer} navigateTo={navigateTo} />;
            case 'adminStores': return <AdminStoresScreen navigateTo={navigateTo} />;
            case 'adminStoreEdit': return <AdminStoreEditScreen store={editingStore} navigateTo={navigateTo} />;
            // Staff pages
            case 'staffCustomers': return <StaffCustomersScreen navigateTo={navigateTo} staffId={user.uid} onLogout={handleLogout} />;
            default: return <LoginScreen setError={setError} error={error} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="container mx-auto max-w-lg p-0">
                {renderPage()}
            </div>
        </div>
    );
}

// --- Screen Components ---

function LoginScreen({ setError, error }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('メールアドレスとパスワードを入力してください。');
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle navigation
        } catch (authError) {
            console.error("Firebase Auth Error:", authError);
            setError("ログインに失敗しました。入力内容を確認してください。");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen p-6 bg-gray-900">
             <h1 className="text-4xl font-bold text-pink-400 mb-2">Host-Manager</h1>
            <p className="text-gray-400 mb-8">スタッフとしてログインしてください</p>
            <form onSubmit={handleLogin} className="w-full max-w-sm">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" className="w-full mb-4 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors" />
                <button type="submit" className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">ログイン</button>
            </form>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </div>
    );
}

function SharedListScreen({ shareId }) {
    const [listData, setListData] = useState(null);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSharedList = async () => {
            if (!shareId) {
                setError('共有IDが見つかりません。');
                setLoading(false);
                return;
            }
            try {
                // 1. Fetch the shared list document
                const listDocRef = doc(db, sharedListsCollectionPath, shareId);
                const listDocSnap = await getDoc(listDocRef);

                if (!listDocSnap.exists()) {
                    setError('この共有リストは存在しないか、削除されました。');
                    setLoading(false);
                    return;
                }
                const data = listDocSnap.data();
                setListData(data);

                // 2. Fetch the store details based on the IDs in the list
                if (data.visitedStoreIds && data.visitedStoreIds.length > 0) {
                     const fetchedStores = [];
                     // Firestore 'in' query is limited to 30 items. If more, chunking is needed.
                     // For simplicity here, assuming under 30.
                    for (const storeId of data.visitedStoreIds) {
                        const storeDocRef = doc(db, storeCollectionPath, storeId);
                        const storeDocSnap = await getDoc(storeDocRef);
                        if(storeDocSnap.exists()) {
                            fetchedStores.push({ id: storeDocSnap.id, ...storeDocSnap.data() });
                        }
                    }
                    setStores(fetchedStores);
                }
            } catch (e) {
                console.error("Error fetching shared list:", e);
                setError('リストの読み込みに失敗しました。');
            }
            setLoading(false);
        };
        fetchSharedList();
    }, [shareId]);

    if (loading) return <div className="p-4 text-center">共有リストを読み込み中...</div>;
    if (error) return <div className="p-4 text-center text-red-400">{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-center mb-1 text-pink-400">{listData?.nickname}様の</h1>
            <h2 className="text-xl font-bold text-center mb-6">行ったことあるお店リスト</h2>
            {stores.length > 0 ? (
                <main className="space-y-3">
                    {stores.map(store => (
                        <div key={store.id} className="bg-gray-800 rounded-lg shadow-lg p-4">
                            <h2 className="text-lg font-bold">{store.name}</h2>
                            <p className="text-gray-400 text-sm">{store.group}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {store.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-gray-700 text-pink-300 px-2 py-1 rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </main>
            ) : (
                <p className="text-center text-gray-400 mt-8">このリストにはまだお店が登録されていません。</p>
            )}
            <footer className="text-center text-gray-600 mt-8 text-sm">
                Powered by Host-Manager
            </footer>
        </div>
    );
}

// StoreListScreen is now for a *specific* customer, managed by staff/admin
function StoreListScreen({ customer, setCustomer, navigateTo, listFilter, setListFilter, today, staffId, onLogout }) {
    const [statusUpdateModal, setStatusUpdateModal] = useState({ isOpen: false, storeId: null });
    const [idFilterModalOpen, setIdFilterModalOpen] = useState(false);
    const [groupFilterModalOpen, setGroupFilterModalOpen] = useState(false);
    const [priceFilterModalOpen, setPriceFilterModalOpen] = useState(false);
    const [numberOfPeopleModalOpen, setNumberOfPeopleModalOpen] = useState(false);
    const [locationTypeFilter, setLocationTypeFilter] = useState(null);
    const [lateNightFilter, setLateNightFilter] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedNumberOfPeople, setSelectedNumberOfPeople] = useState(null);
    const [allStores, setAllStores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState(null);
    const [storeToStop, setStoreToStop] = useState(null);
    
    const customerId = customer.id;
    const customerData = customer.data;

    useEffect(() => {
        const fetchStores = async () => {
            const querySnapshot = await getDocs(collection(db, storeCollectionPath));
            setAllStores(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchStores();
    }, []);

    const allGroups = useMemo(() => [...new Set(allStores.map(s => s.group) || [])], [allStores]);

    const updateStoreStatus = async (storeId, newStatus) => {
        const newStoreStatuses = customerData.storeStatuses.map(s => s.storeId === storeId ? { ...s, status: newStatus } : s);
        const updatedCustomerData = { ...customerData, storeStatuses: newStoreStatuses };
        setCustomer({ ...customer, data: updatedCustomerData });
        setStatusUpdateModal({ isOpen: false, storeId: null });
        try {
            await updateDoc(getCustomerDocPath(customer.staffId, customerId), { storeStatuses: newStoreStatuses });
        } catch (e) { console.error("Error updating store status: ", e); }
    };

    const handleToggleStopStore = async (storeId) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        let currentStopped = customerData.stoppedStores?.filter(s => s.date === todayStr) || [];
        let newStoppedStores;
        
        if (currentStopped.some(s => s.storeId === storeId)) {
            newStoppedStores = customerData.stoppedStores.filter(s => !(s.storeId === storeId && s.date === todayStr));
        } else {
             newStoppedStores = [...(customerData.stoppedStores || []), { storeId, date: todayStr }];
        }
        
        const updatedCustomerData = { ...customerData, stoppedStores: newStoppedStores };
        setCustomer({ ...customer, data: updatedCustomerData });

        try {
            await updateDoc(getCustomerDocPath(customer.staffId, customerId), { stoppedStores: newStoppedStores });
        } catch (e) { console.error("Error stopping store: ", e); }
        setStoreToStop(null);
    };
    
    const combinedStores = useMemo(() => {
        if (!allStores.length) return [];
        return allStores.map(store => {
            const statusInfo = customerData.storeStatuses.find(s => s.storeId === store.id);
            return { ...store, status: statusInfo?.status || 'active' };
        });
    }, [allStores, customerData]);

    const filteredStores = useMemo(() => {
        let stores = [...combinedStores];
        const todayStr = new Date().toISOString().slice(0, 10);
        const stoppedToday = customerData?.stoppedStores?.filter(s => s.date === todayStr).map(s => s.storeId) || [];

        stores = stores.filter(s => !stoppedToday.includes(s.id));

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            stores = stores.filter(s =>
                s.name.toLowerCase().includes(lowercasedTerm) ||
                s.group.toLowerCase().includes(lowercasedTerm) ||
                (s.phoneticName && s.phoneticName.toLowerCase().includes(lowercasedTerm)) ||
                (s.tags && s.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm)))
            );
        }

        if (listFilter === 'visited') stores = stores.filter(s => s.status === 'visited');
        else stores = stores.filter(s => s.status === 'active' || s.status === 'unwanted');
        
        if (selectedGroup) stores = stores.filter(s => s.group === selectedGroup);
        if (selectedPriceRange) stores = stores.filter(s => s.initialPriceMin >= selectedPriceRange.min && s.initialPriceMin <= selectedPriceRange.max);
        if (selectedIds.length > 0) stores = stores.filter(s => selectedIds.every(id => s.requiredIds.includes(id)));
        if (selectedNumberOfPeople) stores = stores.filter(s => s.numberOfPeople >= selectedNumberOfPeople.value);
        if (locationTypeFilter) stores = stores.filter(s => s.locationType === locationTypeFilter);
        if (lateNightFilter) stores = stores.filter(s => s.lateNightOption !== '不可');

        const activeStores = stores.filter(s => s.closingDay !== today && s.status !== 'unwanted');
        const unwantedStores = stores.filter(s => s.status === 'unwanted');
        const closedStores = stores.filter(s => s.closingDay === today);

        activeStores.sort((a, b) => {
            const backChargeA = parseInt(a.backCharge.replace(/[^0-9]/g, ''), 10) || 0;
            const backChargeB = parseInt(b.backCharge.replace(/[^0-9]/g, ''), 10) || 0;
            return backChargeB - backChargeA;
        });

        return [...activeStores, ...unwantedStores, ...closedStores];
    }, [combinedStores, listFilter, selectedGroup, selectedPriceRange, selectedIds, searchTerm, selectedNumberOfPeople, locationTypeFilter, lateNightFilter, customerData, today]);
    
    const resetFilters = () => {
        setLocationTypeFilter(null); setLateNightFilter(false); setSelectedGroup(null);
        setSelectedPriceRange(null); setSelectedIds([]); setSelectedNumberOfPeople(null); setSearchTerm('');
    };

    return (
        <div className="pb-28">
            <header className="p-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                <button onClick={() => navigateTo('staffCustomers')} className="absolute top-4 left-4 text-pink-400 flex items-center gap-2"><ArrowLeft /> 顧客リストへ</button>
                <h1 className="text-2xl font-bold text-center pt-10 mb-4">{listFilter === 'visited' ? '行ったことある店' : `${customerData?.nickname}様の店舗リスト`}</h1>
                <div className="mb-4">
                    <input type="text" placeholder="店名、グループ、タグ、読み仮名で検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-pink-500" />
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                    <button onClick={resetFilters} className="whitespace-nowrap px-4 py-2 text-sm font-semibold bg-gray-600 rounded-full hover:bg-gray-700 transition-colors">リセット</button>
                    <button onClick={() => setGroupFilterModalOpen(true)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedGroup ? 'bg-pink-500 text-white' : 'bg-gray-800 hover:bg-pink-500'}`}>グループ</button>
                    <button onClick={() => setPriceFilterModalOpen(true)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedPriceRange ? 'bg-pink-500 text-white' : 'bg-gray-800 hover:bg-pink-500'}`}>料金</button>
                    <button onClick={() => setIdFilterModalOpen(true)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedIds.length > 0 ? 'bg-pink-500 text-white' : 'bg-gray-800 hover:bg-pink-500'}`}>身分証</button>
                    <button onClick={() => setNumberOfPeopleModalOpen(true)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedNumberOfPeople ? 'bg-pink-500 text-white' : 'bg-gray-800 hover:bg-pink-500'}`}>人数</button>
                    <button onClick={() => setLocationTypeFilter(locationTypeFilter === 'walk' ? null : 'walk')} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-colors ${locationTypeFilter === 'walk' ? 'bg-pink-500 text-white' : 'bg-gray-800 hover:bg-pink-500'}`}>🚶</button>
                    <button onClick={() => setLocationTypeFilter(locationTypeFilter === 'house' ? null : 'house')} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-colors ${locationTypeFilter === 'house' ? 'bg-pink-500 text-white' : 'bg-gray-800 hover:bg-pink-500'}`}>🏠</button>
                    <button onClick={() => setLateNightFilter(!lateNightFilter)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-colors ${lateNightFilter ? 'bg-pink-500 text-white' : 'bg-gray-800 hover:bg-pink-500'}`}>遅い時間帯可</button>
                </div>
            </header>
            <main className="p-4 space-y-3">
                {filteredStores.map(store => (
                    <div key={store.id} className={`relative bg-gray-800 rounded-lg shadow-lg transition-all duration-300 flex items-center p-4 ${store.status === 'unwanted' ? 'opacity-40' : ''}`}>
                        <div className="grow" onClick={() => setSelectedStore(store)}>
                            <div className="flex items-center gap-2"><h2 className="text-lg font-bold">{store.name}</h2>{store.locationType === 'walk' ? '🚶' : '🏠'}{store.contactType === 'phone' ? '📱' : '❌'}</div>
                            <p className="text-gray-400 text-sm">{store.group} / {store.openingTime} / {store.initialPriceMin === store.initialPriceMax ? `${store.initialPriceMin}円` : `${store.initialPriceMin}円~${store.initialPriceMax}円`} / ~{store.numberOfPeople}人</p>
                            <div className="flex flex-wrap gap-2 mt-2">{store.tags.map(tag => (<span key={tag} className="text-xs bg-gray-700 text-pink-300 px-2 py-1 rounded-full">{tag}</span>))}</div>
                        </div>
                        <div className="flex items-center">
                            <button onClick={() => setStoreToStop(store)} className="mr-2 bg-yellow-600 text-white rounded-full p-2 hover:bg-yellow-700 transition-colors"><Ban className="w-5 h-5" /></button>
                            <button onClick={() => setStatusUpdateModal({ isOpen: true, storeId: store.id })} className="bg-gray-700 text-white rounded-full p-2 hover:bg-red-500 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                         {store.closingDay === today && (<div className="absolute inset-0 bg-black/30 flex justify-center items-center rounded-lg pointer-events-none"><span className="text-white text-xl font-bold transform -rotate-12">定休日</span></div>)}
                    </div>
                ))}
            </main>
            {selectedStore && <StoreDetailScreen store={selectedStore} onClose={() => setSelectedStore(null)} />}
            {statusUpdateModal.isOpen && <StatusUpdateModal onClose={() => setStatusUpdateModal({ isOpen: false, storeId: null })} onUpdate={(newStatus) => updateStoreStatus(statusUpdateModal.storeId, newStatus)} />}
            {idFilterModalOpen && <IdSelectionModal currentSelected={selectedIds} onClose={() => setIdFilterModalOpen(false)} onApply={setSelectedIds} />}
            {groupFilterModalOpen && <GroupSelectionModal groups={allGroups} onClose={() => setGroupFilterModalOpen(false)} onSelect={(group) => { setSelectedGroup(group); setGroupFilterModalOpen(false); }} />}
            {priceFilterModalOpen && <PriceSelectionModal onClose={() => setPriceFilterModalOpen(false)} onSelect={(range) => { setSelectedPriceRange(range); setPriceFilterModalOpen(false); }} />}
            {numberOfPeopleModalOpen && <NumberOfPeopleSelectionModal onClose={() => setNumberOfPeopleModalOpen(false)} onSelect={(option) => { setSelectedNumberOfPeople(option); setNumberOfPeopleModalOpen(false); }} />}
            {storeToStop && <ConfirmationModal isOpen={!!storeToStop} onClose={() => setStoreToStop(null)} onConfirm={() => handleToggleStopStore(storeToStop.id)} title="終日ストップ" message={`「${storeToStop.name}」を終日ストップしますか？`} />}
             <BottomNavBar currentFilter={listFilter} setFilter={setListFilter} onLogout={onLogout}/>
        </div>
    );
}

function StoreDetailScreen({ store, onClose }) {
    // Unchanged, but kept for completeness
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [password, setPassword] = useState('');
    const [memo, setMemo] = useState('');
    const [memoUnlocked, setMemoUnlocked] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handlePasswordCheck = () => {
        if (password === '1234') { setMemo(store.staffMemo); setMemoUnlocked(true); setShowPasswordInput(false); } 
        else { setModalMessage('パスワードが違います'); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-full" onClick={(e) => e.stopPropagation()}>
                {modalMessage && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalMessage('')}><div className="bg-gray-800 p-6 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}><p className="text-white">{modalMessage}</p><button onClick={() => setModalMessage('')} className="mt-4 w-full bg-pink-600 text-white py-2 rounded-lg">閉じる</button></div></div>)}
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                <header className="mb-6"><h1 className="text-3xl font-bold">{store.name}</h1><p className="text-gray-400 text-lg">{store.group}</p></header>
                <main className="space-y-6">
                    <div className="bg-gray-700 p-4 rounded-lg"><h3 className="font-bold text-lg mb-2">基本情報</h3><ul className="space-y-2 text-gray-300"><li><strong>営業時間:</strong> {store.openingTime}</li><li><strong>定休日:</strong> {store.closingDay}</li><li><strong>初回時間:</strong> {store.initialTime}分</li><li><strong>初回料金:</strong> {store.initialPriceMin === store.initialPriceMax ? `${store.initialPriceMin}円` : `${store.initialPriceMin}円~${store.initialPriceMax}円`}</li><li><strong>人数:</strong> ~{store.numberOfPeople}人</li><li><strong>遅い時間帯可:</strong> {store.lateNightOption}</li><li><strong>属性:</strong> {store.locationType === 'walk' ? '🚶' : '🏠'} {store.contactType === 'phone' ? '📱' : '❌'}</li><li><strong>必須本人確認書類:</strong> {store.requiredIds.join(', ')}</li><li className="flex flex-wrap gap-2 items-center"><strong>タグ:</strong> {store.tags.map(tag => (<span key={tag} className="text-xs bg-gray-600 text-pink-300 px-2 py-1 rounded-full">{tag}</span>))}</li></ul></div>
                    <div className="grid grid-cols-2 gap-4"><a href={store.hosuhosuUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"><LinkIcon /> ホスホス</a><a href={store.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"><MapPin /> 地図</a></div>
                    <div className="bg-gray-700 p-4 rounded-lg">{!memoUnlocked && (<button onClick={() => setShowPasswordInput(!showPasswordInput)} className="w-full text-center text-pink-400 font-bold py-2">スタッフ専用メモを見る</button>)}{showPasswordInput && (<div className="mt-4"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="4桁のパスワード" className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white" maxLength="4" /><button onClick={handlePasswordCheck} className="w-full mt-2 bg-pink-600 text-white font-bold py-2 rounded-lg">確認</button></div>)}{memoUnlocked && (<div><h3 className="font-bold text-lg mb-2">スタッフ専用メモ</h3><p className="text-gray-300 whitespace-pre-wrap bg-gray-600 p-3 rounded">{memo}</p><p><strong>バック料金:</strong> {store.backCharge}</p></div>)}</div>
                </main>
            </div>
        </div>
    );
}

function AdminScreen({ navigateTo, onLogout }) {
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">管理者メニュー</h1>
                <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-pink-400"><LogOut/>ログアウト</button>
            </div>
            <div className="space-y-4">
                <button onClick={() => navigateTo('adminStores')} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
                    <h2 className="text-lg font-bold">店舗情報管理</h2><p className="text-sm text-gray-400">店舗の追加、編集を行います</p>
                </button>
                 <button onClick={() => navigateTo('adminCustomers')} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
                    <h2 className="text-lg font-bold">全顧客の管理</h2><p className="text-sm text-gray-400">全スタッフの顧客情報を確認します</p>
                </button>
            </div>
        </div>
    );
}

function AdminCustomersScreen({ navigateTo }) {
    const [customers, setCustomers] = useState([]);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [toast, setToast] = useState('');

    const fetchCustomers = async () => {
        try {
            // Use collection group query to get all customers across all staffs
            const q = query(collectionGroup(db, 'customers'));
            const querySnapshot = await getDocs(q);
            const customersList = querySnapshot.docs.map(doc => {
                const pathParts = doc.ref.path.split('/');
                const staffId = pathParts[pathParts.indexOf('staffs') + 1];
                return { id: doc.id, staffId: staffId, ...doc.data() };
            });
            setCustomers(customersList);
        } catch (error) { console.error("Error fetching customers: ", error); }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const handleDeleteCustomer = async () => {
        if (!customerToDelete) return;
        try {
            await deleteDoc(getCustomerDocPath(customerToDelete.staffId, customerToDelete.id));
            setToast(`顧客「${customerToDelete.nickname}」を削除しました。`);
            setCustomerToDelete(null);
            fetchCustomers();
        } catch (error) {
            console.error("Error deleting customer: ", error);
            setToast('顧客の削除に失敗しました。');
        }
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <div className="p-4">
            {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">{toast}</div>}
            <div className="flex justify-between items-center mb-6">
                 <button onClick={() => navigateTo('admin')} className="flex items-center gap-2 text-pink-400"><ArrowLeft />管理メニュー</button>
                 <h1 className="text-2xl font-bold">全顧客リスト</h1><div className="w-16"></div>
            </div>
            <div className="space-y-3">
                {customers.map(customer => (
                    <div key={`${customer.staffId}-${customer.id}`} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                        <div onClick={() => navigateTo('adminCustomerDetail', { id: customer.id, staffId: customer.staffId })} className="cursor-pointer grow">
                            <p className="font-bold">{customer.nickname}</p>
                            <p className="text-xs text-gray-400 truncate">担当Staff UID: {customer.staffId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCustomerToDelete(customer)} className="p-2 bg-gray-700 rounded-full hover:bg-red-500"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmationModal isOpen={!!customerToDelete} onClose={() => setCustomerToDelete(null)} onConfirm={handleDeleteCustomer} title="顧客の削除" message={`本当に顧客「${customerToDelete?.nickname}」を削除しますか？この操作は元に戻せません。`}/>
        </div>
    );
}

// Staff's version of the customer list screen
function StaffCustomersScreen({ navigateTo, staffId, onLogout }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const createNewCustomer = async () => {
        try {
            const storesSnapshot = await getDocs(collection(db, storeCollectionPath));
            const storeStatuses = storesSnapshot.docs.map(doc => ({ storeId: doc.id, status: 'active' }));
            const newCustomer = { nickname: "新規顧客", storeStatuses, createdAt: new Date(), preferences: "", possessedIdTypes: [], stoppedStores: [] };
            
            const newDocRef = await addDoc(collection(db, getCustomerCollectionPath(staffId)), newCustomer);
            
            navigateTo('list', { id: newDocRef.id, data: newCustomer, staffId: staffId });
        } catch (e) { console.error("Error creating new customer: ", e); }
    };

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const q = query(collection(db, getCustomerCollectionPath(staffId)));
                const querySnapshot = await getDocs(q);
                const customersList = querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
                setCustomers(customersList);
            } catch (error) { console.error("Error fetching customers: ", error); }
            setLoading(false);
        };
        fetchCustomers();
    }, [staffId]);

    if (loading) return <div className="p-4 text-center">顧客情報を読み込み中...</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold">担当顧客リスト</h1>
                 <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-pink-400"><LogOut/>ログアウト</button>
            </div>
             <button onClick={createNewCustomer} className="w-full mb-4 flex items-center justify-center gap-2 p-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"><PlusCircle/>新規顧客を追加</button>
            <div className="space-y-3">
                {customers.map(customer => (
                    <div key={customer.id} onClick={() => navigateTo('list', { ...customer, staffId: staffId })} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700">
                        <div>
                            <p className="font-bold">{customer.data.nickname}</p>
                            <p className="text-xs text-gray-400 truncate">作成日: {customer.data.createdAt.toDate().toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// A unified customer detail screen for admins
function AdminCustomerDetailScreen({ customer, navigateTo }) {
    const [customerData, setCustomerData] = useState(null);
    const [allStores, setAllStores] = useState([]);
    const [preferences, setPreferences] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [storeSearchTerm, setStoreSearchTerm] = useState('');

    const { id: customerId, staffId } = customer;

    useEffect(() => {
        const fetchAllData = async () => {
            if (!customerId || !staffId) return;
            setLoading(true);
            try {
                const storesSnapshot = await getDocs(collection(db, storeCollectionPath));
                setAllStores(storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                const docRef = getCustomerDocPath(staffId, customerId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCustomerData(data);
                    setPreferences(data.preferences || '');
                    setNickname(data.nickname || '');
                }
            } catch (error) { console.error("Error fetching customer details: ", error); }
            setLoading(false);
        };
        fetchAllData();
    }, [customerId, staffId]);

    const handleSave = async () => {
        try {
            const customerRef = getCustomerDocPath(staffId, customerId);
            await updateDoc(customerRef, { 
                preferences: preferences, nickname: nickname,
                storeStatuses: customerData.storeStatuses,
                possessedIdTypes: customerData.possessedIdTypes,
            });
            setToast('保存しました！'); setTimeout(() => setToast(''), 2000);
        } catch (error) {
            console.error("Error saving customer data: ", error);
            setToast('保存に失敗しました。'); setTimeout(() => setToast(''), 2000);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(getCustomerDocPath(staffId, customerId));
            setIsDeleteModalOpen(false);
            setToast('顧客を削除しました。');
            setTimeout(() => navigateTo('adminCustomers'), 1500);
        } catch (error) {
            console.error("Error deleting customer: ", error);
            setToast('削除に失敗しました。'); setTimeout(() => setToast(''), 2000);
        }
    };
    
    const handleCreateShareLink = async () => {
        const visitedStoreIds = customerData.storeStatuses
            .filter(s => s.status === 'visited')
            .map(s => s.storeId);

        if (visitedStoreIds.length === 0) {
            setToast('「行ったことある店」がありません。');
            setTimeout(() => setToast(''), 3000);
            return;
        }

        try {
            const docRef = await addDoc(collection(db, sharedListsCollectionPath), {
                nickname: customerData.nickname,
                visitedStoreIds: visitedStoreIds,
                createdAt: new Date()
            });
            const shareUrl = `${window.location.origin}${window.location.pathname}?shareId=${docRef.id}`;
            await navigator.clipboard.writeText(shareUrl);
            setToast('共有リンクをクリップボードにコピーしました！');
        } catch (error) {
            console.error("Error creating share link: ", error);
            setToast('共有リンクの作成に失敗しました。');
        }
        setTimeout(() => setToast(''), 3000);
    };


    const handleStoreStatusChange = (storeId, newStatus) => {
        let newStoreStatuses = [];
        const existingStatus = customerData.storeStatuses.find(s => s.storeId === storeId);
        if (existingStatus) {
            newStoreStatuses = customerData.storeStatuses.map(s => s.storeId === storeId ? { ...s, status: newStatus } : s);
        } else {
            newStoreStatuses = [...customerData.storeStatuses, { storeId, status: newStatus }];
        }
        setCustomerData(prev => ({ ...prev, storeStatuses: newStoreStatuses }));
    };

    const handleIdTypeChange = (idType) => {
        const possessedIdTypes = customerData.possessedIdTypes || [];
        const newIdTypes = possessedIdTypes.includes(idType)
            ? possessedIdTypes.filter(id => id !== idType)
            : [...possessedIdTypes, idType];
        setCustomerData(prev => ({ ...prev, possessedIdTypes: newIdTypes }));
    };

    if (loading) return <div className="p-4 text-center">顧客情報を読み込み中...</div>;
    if (!customerData) return <div className="p-4 text-center">顧客情報が見つかりません。</div>;
    
    const filteredStoresForAdmin = allStores.filter(store => store.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) || (store.phoneticName && store.phoneticName.toLowerCase().includes(storeSearchTerm.toLowerCase())));

    return (
        <div className="p-4 pb-24">
            {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">{toast}</div>}
            <button onClick={() => navigateTo('adminCustomers')} className="flex items-center gap-2 mb-4 text-pink-400"><ArrowLeft />顧客管理に戻る</button>
            <div className="mb-4">
                <label className="text-sm text-gray-400">ニックネーム</label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full p-2 bg-gray-800 rounded-md mt-1 text-2xl font-bold"/>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h2 className="font-bold text-lg mb-2">行ったことある店</h2>
                <input type="text" placeholder="店舗名で検索..." value={storeSearchTerm} onChange={(e) => setStoreSearchTerm(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 mb-4"/>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {filteredStoresForAdmin.map(store => (
                        <label key={store.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded-md">
                            <input type="checkbox" checked={customerData.storeStatuses.some(s => s.storeId === store.id && s.status === 'visited')} onChange={() => handleStoreStatusChange(store.id, customerData.storeStatuses.some(s => s.storeId === store.id && s.status === 'visited') ? 'active' : 'visited')} className="form-checkbox bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"/>
                            <span>{store.name}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h2 className="font-bold text-lg mb-2">所持している本人確認書類</h2>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {idTypes.map(idType => (
                        <label key={idType} className="flex items-center gap-2 p-2 bg-gray-700 rounded-md">
                            <input type="checkbox" checked={customerData.possessedIdTypes?.includes(idType)} onChange={() => handleIdTypeChange(idType)} className="form-checkbox bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"/>
                            <span>{idType}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="font-bold text-lg mb-2">お店の好み（メモ）</h2>
                <textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} className="w-full h-32 p-2 bg-gray-700 rounded-md text-white" placeholder="例：静かなお店が好き、シャンパンコールは苦手など"></textarea>
            </div>
            <div className="mt-6 space-y-3">
                 <button onClick={handleSave} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg">保存</button>
                 <button onClick={handleCreateShareLink} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"><Share2/>行った店リストの共有リンクを作成</button>
                 <button onClick={() => setIsDeleteModalOpen(true)} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg">この顧客を削除する</button>
            </div>
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} title="顧客の削除" message={`本当に顧客「${nickname}」を削除しますか？この操作は元に戻せません。`}/>
        </div>
    );
}

function AdminStoresScreen({ navigateTo }) {
    // Unchanged, but kept for completeness
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
	const fetchStores = async () => {
	  const querySnapshot = await getDocs(collection(db, storeCollectionPath));
	  const fetchedStores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	  fetchedStores.sort((a, b) => a.name.localeCompare(b.name));
	  setStores(fetchedStores);
	  setLoading(false);
	};
	fetchStores();
    }, []);

    if (loading) return <div className="p-4 text-center">店舗情報を読み込み中...</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigateTo('admin')} className="flex items-center gap-2 text-pink-400"><ArrowLeft />管理メニュー</button>
                <h1 className="text-2xl font-bold">店舗管理</h1>
                <div className="w-16"></div>
            </div>
            <button onClick={() => navigateTo('adminStoreEdit', null)} className="w-full mb-4 flex items-center justify-center gap-2 p-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"><PlusCircle/>新規店舗を追加</button>
            <div className="space-y-3">
                {stores.map(store => (
                    <div key={store.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                        <div><p className="font-bold">{store.name}</p><p className="text-xs text-gray-400">{store.group}</p></div>
                        <button onClick={() => navigateTo('adminStoreEdit', store)} className="p-2 bg-gray-700 rounded-full hover:bg-pink-500"><Edit className="w-5 h-5" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdminStoreEditScreen({ store, navigateTo }) {
    // Unchanged, but kept for completeness
    const [formData, setFormData] = useState({ name: '', group: '', phoneticName: '', openingTime: '', initialTime: '', closingDay: '', lateNightOption: '不可', initialPriceMin: '', initialPriceMax: '', backCharge: '', tags: '', requiredIds: [], hosuhosuUrl: '', mapUrl: '', staffMemo: '', numberOfPeople: 1, locationType: 'walk', contactType: 'phone' });
    const [hasPriceRange, setHasPriceRange] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (store) {
            const isRange = store.initialPriceMin !== store.initialPriceMax;
            setHasPriceRange(isRange);
            setFormData({ ...store, tags: store.tags.join(', '), requiredIds: store.requiredIds || [], initialPriceMax: isRange ? (store.initialPriceMax || '') : '' });
        }
    }, [store]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleIdChange = (id) => setFormData(prev => ({...prev, requiredIds: prev.requiredIds.includes(id) ? prev.requiredIds.filter(i => i !== id) : [...prev.requiredIds, id]}));
    const handleAttributeChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

    const handleSave = async () => {
        const minPrice = Number(formData.initialPriceMin) || 0;
        const maxPrice = hasPriceRange ? (Number(formData.initialPriceMax) || minPrice) : minPrice;
        const dataToSave = { ...formData, initialPriceMin: minPrice, initialPriceMax: maxPrice, initialPriceText: hasPriceRange ? `${minPrice}円~${maxPrice}円` : `${minPrice}円`, tags: formData.tags.split(',').map(t => t.trim()).filter(t => t), numberOfPeople: Number(formData.numberOfPeople) || 1, initialTime: Number(formData.initialTime) || 0 };
        
        try {
            if (store) { await setDoc(doc(db, storeCollectionPath, store.id), dataToSave); } 
            else { await addDoc(collection(db, storeCollectionPath), dataToSave); }
            setToast('保存しました！');
            setTimeout(() => navigateTo('adminStores'), 1500);
        } catch (e) {
            console.error("Error saving store: ", e);
            setToast('保存に失敗しました。');
            setTimeout(() => setToast(''), 2000);
        }
    };

    return (
        <div className="p-4 pb-10">
            {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">{toast}</div>}
            <button onClick={() => navigateTo('adminStores')} className="flex items-center gap-2 mb-4 text-pink-400"><ArrowLeft />店舗管理に戻る</button>
            <h1 className="text-2xl font-bold mb-6">{store ? '店舗情報を編集' : '新規店舗を追加'}</h1>
            <div className="space-y-4">
                <div><label className="text-sm text-gray-400">店名</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">グループ</label><input type="text" name="group" value={formData.group} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">読み仮名 / 通称</label><input type="text" name="phoneticName" value={formData.phoneticName} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">営業時間</label><input type="text" name="openingTime" value={formData.openingTime} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">初回時間 (分)</label><input type="number" name="initialTime" value={formData.initialTime} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">定休日</label><input type="text" name="closingDay" value={formData.closingDay} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div>
                    <label className="text-sm text-gray-400">遅い時間帯可</label>
                    <div className="flex gap-2 mt-1">{lateNightOptions.map(option => (<button key={option.value} onClick={() => handleAttributeChange('lateNightOption', option.value)} className={`px-4 py-2 rounded-full text-sm ${formData.lateNightOption === option.value ? 'bg-pink-500' : 'bg-gray-700'}`}>{option.label}</button>))}</div>
                </div>
                <div><label className="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={hasPriceRange} onChange={(e) => setHasPriceRange(e.target.checked)} className="form-checkbox bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"/><span>料金に差がある</span></label></div>
                {hasPriceRange ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm text-gray-400">最低料金 (円)</label><input type="number" name="initialPriceMin" value={formData.initialPriceMin} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                        <div><label className="text-sm text-gray-400">最高料金 (円)</label><input type="number" name="initialPriceMax" value={formData.initialPriceMax} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                    </div>
                ) : ( <div><label className="text-sm text-gray-400">初回料金 (円)</label><input type="number" name="initialPriceMin" value={formData.initialPriceMin} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div> )}
                <div><label className="text-sm text-gray-400">バック料金</label><input type="text" name="backCharge" value={formData.backCharge} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">タグ (カンマ区切り)</label><input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div>
                    <label className="text-sm text-gray-400">人数</label>
                    <select name="numberOfPeople" value={formData.numberOfPeople} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1">{numberOfPeopleOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}</select>
                </div>
                <div>
                    <label className="text-sm text-gray-400">属性</label>
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => handleAttributeChange('locationType', 'walk')} className={`px-4 py-2 rounded-full text-sm ${formData.locationType === 'walk' ? 'bg-pink-500' : 'bg-gray-700'}`}>🚶</button>
                        <button onClick={() => handleAttributeChange('locationType', 'house')} className={`px-4 py-2 rounded-full text-sm ${formData.locationType === 'house' ? 'bg-pink-500' : 'bg-gray-700'}`}>🏠</button>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => handleAttributeChange('contactType', 'phone')} className={`px-4 py-2 rounded-full text-sm ${formData.contactType === 'phone' ? 'bg-pink-500' : 'bg-gray-700'}`}>📱</button>
                        <button onClick={() => handleAttributeChange('contactType', 'none')} className={`px-4 py-2 rounded-full text-sm ${formData.contactType === 'none' ? 'bg-pink-500' : 'bg-gray-700'}`}>❌</button>
                    </div>
                </div>
                <div>
                    <label className="text-sm text-gray-400">必須身分証</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">{idTypes.map(id => (<label key={id} className="flex items-center gap-2 p-2 bg-gray-800 rounded-md"><input type="checkbox" checked={formData.requiredIds.includes(id)} onChange={() => handleIdChange(id)} className="form-checkbox bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"/><span>{id}</span></label>))}</div>
                </div>
                <div><label className="text-sm text-gray-400">ホスホスURL</label><input type="url" name="hosuhosuUrl" value={formData.hosuhosuUrl} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">地図URL</label><input type="url" name="mapUrl" value={formData.mapUrl} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">スタッフ専用メモ</label><textarea name="staffMemo" value={formData.staffMemo} onChange={handleChange} className="w-full h-24 p-2 bg-gray-800 rounded-md mt-1"></textarea></div>
                <button onClick={handleSave} className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg">保存する</button>
            </div>
        </div>
    );
}


// --- Lower Navigation Bar & Modals (Largely Unchanged) ---
function BottomNavBar({ currentFilter, setFilter, onLogout }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 max-w-lg mx-auto h-20 flex items-center justify-around px-4">
            <button onClick={() => setFilter('visited')} className={`flex flex-col items-center justify-center w-24 h-full ${currentFilter === 'visited' ? 'text-pink-400' : 'text-gray-400'}`}><CheckSquare className="w-7 h-7 mb-1" /><span className="text-xs">行った店</span></button>
            <button onClick={() => setFilter('all')} className={`flex items-center justify-center w-20 h-20 -mt-8 rounded-full shadow-lg transition-transform transform hover:scale-110 ${currentFilter === 'all' ? 'bg-pink-600' : 'bg-gray-700'}`}><Home className="w-9 h-9 text-white" /></button>
            <button onClick={onLogout} className="flex flex-col items-center justify-center w-24 h-full text-gray-400"><LogOut className="w-7 h-7 mb-1" /><span className="text-xs">ログアウト</span></button>
        </nav>
    );
}
function StatusUpdateModal({ onClose, onUpdate }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 text-center"><h3 className="font-bold text-lg">ステータスを選択</h3></div>
                <div className="flex flex-col p-2">
                    <button onClick={() => onUpdate('visited')} className="w-full text-left p-3 text-lg text-green-400 hover:bg-gray-700 rounded-md">✅ 行ったことある</button>
                    <button onClick={() => onUpdate('unwanted')} className="w-full text-left p-3 text-lg text-red-400 hover:bg-gray-700 rounded-md">🚫 行きたくない</button>
                    <button onClick={onClose} className="w-full text-left p-3 text-lg text-gray-400 hover:bg-gray-700 rounded-md">❌ キャンセル</button>
                </div>
            </div>
        </div>
    );
}
function IdSelectionModal({ currentSelected, onClose, onApply }) {
    const [selected, setSelected] = useState(currentSelected);
    const toggleId = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 text-center"><h3 className="font-bold text-lg">身分証を選択</h3></div>
                <div className="p-2 space-y-1">{idTypes.map(type => (<label key={type} className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-md cursor-pointer"><input type="checkbox" checked={selected.includes(type)} onChange={() => toggleId(type)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"/><span>{type}</span></label>))}</div>
                <div className="p-2"><button onClick={() => { onApply(selected); onClose(); }} className="w-full bg-pink-600 text-white font-bold py-2 rounded-lg">適用</button></div>
            </div>
        </div>
    );
}
function GroupSelectionModal({ groups, onClose, onSelect }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 text-center"><h3 className="font-bold text-lg">グループを選択</h3></div>
                <div className="flex flex-col p-2 max-h-64 overflow-y-auto">
                    <button onClick={() => onSelect(null)} className="w-full text-left p-3 text-lg hover:bg-gray-700 rounded-md">すべてのグループ</button>
                    {groups.map(group => (<button key={group} onClick={() => onSelect(group)} className="w-full text-left p-3 text-lg hover:bg-gray-700 rounded-md">{group}</button>))}
                </div>
            </div>
        </div>
    );
}
function PriceSelectionModal({ onClose, onSelect }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 text-center"><h3 className="font-bold text-lg">料金を選択</h3></div>
                <div className="flex flex-col p-2 max-h-64 overflow-y-auto">
                    <button onClick={() => onSelect(null)} className="w-full text-left p-3 text-lg hover:bg-gray-700 rounded-md">すべての料金</button>
                    {priceFilterRanges.map(range => (<button key={range.label} onClick={() => onSelect(range)} className="w-full text-left p-3 text-lg hover:bg-gray-700 rounded-md">{range.label}</button>))}
                </div>
            </div>
        </div>
    );
}
function NumberOfPeopleSelectionModal({ onClose, onSelect }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 text-center"><h3 className="font-bold text-lg">人数を選択</h3></div>
                <div className="flex flex-col p-2 max-h-64 overflow-y-auto">
                    <button onClick={() => onSelect(null)} className="w-full text-left p-3 text-lg hover:bg-gray-700 rounded-md">すべての人数</button>
                    {numberOfPeopleOptions.map(option => (<button key={option.label} onClick={() => onSelect(option)} className="w-full text-left p-3 text-lg hover:bg-gray-700 rounded-md">{option.label}</button>))}
                </div>
            </div>
        </div>
    );
}
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xs p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-lg text-center mb-2">{title}</h3>
                <p className="text-gray-300 text-center mb-6">{message}</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg">キャンセル</button>
                    <button onClick={onConfirm} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg">OK</button>
                </div>
            </div>
        </div>
    );
}

export default App;