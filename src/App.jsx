import React, { useState, useEffect, useMemo } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, getDocs, writeBatch, deleteDoc, collectionGroup, where, onSnapshot } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// --- ▼▼▼ 管理者のUIDをここに追加 ▼▼▼ ---
// 例: const ADMIN_UIDS = ["zW9wAbcDEfgHIjklMnoPQRsTuvW2", "anotherAdminUid..."];
const ADMIN_UIDS = ["1UkAgjz9Jshc8tEpVycPDww67I12"];
// --- ▲▲▲ ここまで ▲▲▲ ---

// --- Icon Components (No changes) ---
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
const Share2 = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>);
const Ban = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>);

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
const appId = (typeof __app_id !== 'undefined' ? __app_id : 'default-app-id').replace(/\//g, '_');
const storeCollectionPath = `artifacts/${appId}/public/data/stores`;
const sharedListsCollectionPath = `artifacts/${appId}/public/data/sharedLists`;
const staffsCollectionPath = `artifacts/${appId}/public/data/staffs`;

// --- Constant Data ---
const idTypes = ["運転免許証", "マイナンバー", "パスポート", "保険証", "キャッシュカード", "クレジットカード"];
const priceFilterRanges = [
    { label: "無料", min: 0, max: 0 }, { label: "~1000円", min: 1, max: 1000 }, { label: "~2000円", min: 1001, max: 2000 }, { label: "~3000円", min: 2001, max: 3000 }, { label: "~5000円", min: 3001, max: 5000 }, { label: "~10000円", min: 5001, max: 10000 }
];
const numberOfPeopleOptions = [
    { label: "~1人", value: 1 }, { label: "~2人", value: 2 }, { label: "~3人", value: 3 }, { label: "~4人", value: 4 }
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
    const [listFilter, setListFilter] = useState('all');
    const [customerId, setCustomerId] = useState(null);
    const [customerData, setCustomerData] = useState(null);
    const [selectedAdminCustomer, setSelectedAdminCustomer] = useState(null);
    const [editingStore, setEditingStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [today, setToday] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [shareId, setShareId] = useState(null);
    const [shareModalData, setShareModalData] = useState({ isOpen: false, url: '' });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('shareId');
        if (id) {
            setShareId(id);
            setPage('sharedList');
        }

        const date = new Date();
        const days = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
        setToday(days[date.getDay()]);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                setIsAdmin(ADMIN_UIDS.includes(user.uid)); 
                
                if (!shareId) setPage('customerSelection');

                try {
                    const storesSnapshot = await getDocs(collection(db, storeCollectionPath));
                    if (storesSnapshot.empty) {
                        const batch = writeBatch(db);
                        initialStoresData.forEach(store => batch.set(doc(db, storeCollectionPath, store.id), store));
                        await batch.commit();
                    }
                } catch (setupError) {
                    console.error("Error during initial store setup:", setupError);
                    setError("店舗データの初期設定に失敗しました。");
                }
            } else {
                if (!shareId) setPage('login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [shareId]);

    const getCustomerCollectionPath = () => {
        if (!currentUser) return null;
        return `artifacts/${appId}/users/${currentUser.uid}/customers`;
    };

    const loadCustomerData = async (id) => {
        setError(''); setLoading(true);
        if (!id) { setError("顧客IDが無効です。"); setLoading(false); return; }
        const customerPath = getCustomerCollectionPath();
        if (!customerPath) { setError("ログインしていません。"); setLoading(false); return; }
        try {
            const docRef = doc(db, customerPath, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setCustomerData(docSnap.data()); setCustomerId(id); setPage('list');
            } else { setError("指定された顧客IDは存在しません。"); }
        } catch (e) { console.error("Error loading customer data: ", e); setError("データの読み込みに失敗しました。"); }
        setLoading(false);
    };

    const createNewCustomer = async () => {
        setError(''); setLoading(true);
        const customerPath = getCustomerCollectionPath();
        if (!customerPath) { setError("ログインしていません。"); setLoading(false); return; }

        try {
            const storesSnapshot = await getDocs(collection(db, storeCollectionPath));
            const storeStatuses = storesSnapshot.docs.map(doc => ({ storeId: doc.id, status: 'active' }));
            const newCustomer = { nickname: "新規顧客", storeStatuses, createdAt: new Date(), preferences: "", possessedIdTypes: [] };
            const newId = `&${Math.random().toString(36).substring(2, 8)}`;
            await setDoc(doc(db, customerPath, newId), newCustomer);
            setCustomerData(newCustomer); setCustomerId(newId); setPage('list'); setListFilter('all');
        } catch (e) { console.error("Error creating new customer: ", e); setError("新規顧客の作成に失敗しました。"); }
        setLoading(false);
    };

    const viewAsGuest = () => { setCustomerId(null); setCustomerData(null); setPage('list'); };
    const navigateTo = (targetPage, data = null) => {
        if (targetPage === 'adminCustomerDetail') setSelectedAdminCustomer(data);
        if (targetPage === 'adminStoreEdit') setEditingStore(data);
        setPage(targetPage);
    };
    const handleLogout = async () => {
        await signOut(auth);
        setCustomerId(null); setCustomerData(null); setCurrentUser(null); setIsAdmin(false); setPage('login');
    };

    const renderPage = () => {
        if (page === 'loading') return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
        
        switch (page) {
            case 'login': return <LoginScreen setError={setError} error={error} />;
            case 'sharedList': return <SharedListScreen shareId={shareId} />;
            case 'customerSelection': return <CustomerSelectionScreen onSelect={loadCustomerData} onCreate={createNewCustomer} onViewAsGuest={viewAsGuest} error={error} today={today} handleLogout={handleLogout} navigateTo={navigateTo} />;
            case 'list': return <StoreListScreen customerData={customerData} setCustomerData={setCustomerData} customerId={customerId} listFilter={listFilter} setListFilter={setListFilter} today={today} getCustomerCollectionPath={getCustomerCollectionPath} navigateTo={navigateTo} isAdmin={isAdmin} />;
            case 'admin': return <AdminScreen navigateTo={navigateTo} isAdmin={isAdmin} />;
            case 'adminCustomers': return <AdminCustomersScreen navigateTo={navigateTo} getCustomerCollectionPath={getCustomerCollectionPath} setShareModalData={setShareModalData} />;
            case 'adminCustomerDetail': return <AdminCustomerDetailScreen customerInfo={selectedAdminCustomer} navigateTo={navigateTo} setShareModalData={setShareModalData}/>;
            case 'adminStores': return <AdminStoresScreen navigateTo={navigateTo} />;
            case 'adminStoreEdit': return <AdminStoreEditScreen store={editingStore} navigateTo={navigateTo} />;
            case 'adminStaffManagement': return <AdminStaffManagementScreen navigateTo={navigateTo} />;
            default: return <LoginScreen setError={setError} error={error} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="container mx-auto max-w-lg p-0">
                {renderPage()}
                {shareModalData.isOpen && <ShareModal url={shareModalData.url} onClose={() => setShareModalData({ isOpen: false, url: ''})} />}
            </div>
            {page === 'list' && <BottomNavBar currentFilter={listFilter} setFilter={setListFilter} onLogout={() => { setCustomerId(null); setCustomerData(null); setPage('customerSelection'); }} />}
        </div>
    );
}

// --- Screen Components ---

function LoginScreen({ setError, error }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (e) {
            setError('メールアドレスまたはパスワードが正しくありません。');
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen p-6 bg-gray-900">
            <h1 className="text-4xl font-bold text-pink-400 mb-2">Host-Manager</h1>
            <p className="text-gray-400 mb-8">スタッフアカウントでログインしてください</p>
            <div className="w-full max-w-sm">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" className="w-full mb-4 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500" />
                <button onClick={handleLogin} className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg">ログイン</button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}

function CustomerSelectionScreen({ onSelect, onCreate, onViewAsGuest, error, today, handleLogout, navigateTo }) {
    const [inputId, setInputId] = useState('');
    return (
        <div className="flex flex-col justify-center items-center h-screen p-6 pb-24">
            <div className="absolute top-5 bg-blue-500 text-white text-center p-2 rounded-lg">本日は{today}です</div>
            <h1 className="text-4xl font-bold text-pink-400 mb-2">Host-Manager</h1>
            <p className="text-gray-400 mb-8">顧客IDを入力または新規作成してください</p>
            <div className="w-full max-w-sm">
                <input type="text" value={inputId} onChange={(e) => setInputId(e.target.value)} placeholder="顧客ID" className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500" />
                <button onClick={() => onSelect(inputId)} className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg">表示</button>
            </div>
            <div className="my-6 text-gray-500">または</div>
            <button onClick={onCreate} className="w-full max-w-sm bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg">新規顧客IDを発行</button>
            <button onClick={onViewAsGuest} className="w-full max-w-sm mt-4 border-2 border-pink-500 text-pink-500 font-bold py-3 px-4 rounded-lg">店舗一覧を見る</button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <div className="absolute bottom-6 right-6 flex items-center gap-4">
                 <button onClick={() => navigateTo('admin')} className="flex items-center gap-2 text-gray-400 hover:text-pink-400"><Shield className="w-5 h-5" />管理者</button>
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-pink-400"><LogOut className="w-5 h-5" />ログアウト</button>
            </div>
        </div>
    );
}
function StoreListScreen({ customerData, setCustomerData, customerId, listFilter, setListFilter, today, getCustomerCollectionPath, navigateTo, isAdmin }) {
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
    const [statusUpdateModal, setStatusUpdateModal] = useState({ isOpen: false, storeId: null });

    useEffect(() => {
        const fetchStores = async () => {
            const querySnapshot = await getDocs(collection(db, storeCollectionPath));
            setAllStores(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchStores();
    }, []);

    const allGroups = useMemo(() => [...new Set(allStores.map(s => s.group) || [])], [allStores]);

    const updateStoreStatus = async (storeId, newStatus) => {
        if (!customerId) return;
        const customerPath = getCustomerCollectionPath();
        const newStoreStatuses = customerData.storeStatuses.map(s => s.storeId === storeId ? { ...s, status: newStatus } : s);
        const updatedCustomerData = { ...customerData, storeStatuses: newStoreStatuses };
        setCustomerData(updatedCustomerData);
        try {
            const customerRef = doc(db, customerPath, customerId);
            await updateDoc(customerRef, { storeStatuses: newStoreStatuses });
        } catch (e) { console.error("Error updating store status: ", e); }
    };
    
    const combinedStores = useMemo(() => {
        if (!allStores.length) return [];
        if (!customerData) return allStores.map(store => ({...store, status: 'active'}));
        return allStores.map(store => {
            const statusInfo = customerData.storeStatuses.find(s => s.storeId === store.id);
            return { ...store, status: statusInfo?.status || 'active' };
        });
    }, [allStores, customerData]);

    const filteredStores = useMemo(() => {
        let stores = [...combinedStores];

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
        else if (customerId) stores = stores.filter(s => s.status === 'active' || s.status === 'unwanted');
        
        if (selectedGroup) stores = stores.filter(s => s.group === selectedGroup);
        if (selectedPriceRange) stores = stores.filter(s => s.initialPriceMin >= selectedPriceRange.min && s.initialPriceMin <= selectedPriceRange.max);
        if (selectedIds.length > 0) stores = stores.filter(s => s.requiredIds.every(id => s.requiredIds.includes(id)));
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
    }, [combinedStores, listFilter, selectedGroup, selectedPriceRange, selectedIds, searchTerm, selectedNumberOfPeople, locationTypeFilter, lateNightFilter, customerData, today, customerId]);
    
    const resetFilters = () => {
        setLocationTypeFilter(null);
        setLateNightFilter(false);
        setSelectedGroup(null);
        setSelectedPriceRange(null);
        setSelectedIds([]);
        setSelectedNumberOfPeople(null);
        setSearchTerm('');
    };

    return (
        <div className="pb-28">
            <header className="p-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                 {!customerId && <button onClick={() => navigateTo('customerSelection')} className="absolute top-4 left-4 text-pink-400 flex items-center gap-2"><ArrowLeft /> 戻る</button>}
                <h1 className="text-2xl font-bold text-center mb-4">{listFilter === 'visited' ? '行ったことある店' : `${customerData?.nickname || '店舗'}リスト`}</h1>
                <div className="mb-4">
                    <input type="text" placeholder="店名、グループ、タグ、読み仮名で検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-500"/>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                    <button onClick={resetFilters} className="whitespace-nowrap px-4 py-2 text-sm font-semibold bg-gray-600 rounded-full hover:bg-gray-700">リセット</button>
                    <button onClick={() => setGroupFilterModalOpen(true)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full ${selectedGroup ? 'bg-pink-500' : 'bg-gray-800 hover:bg-pink-500'}`}>グループ</button>
                    <button onClick={() => setPriceFilterModalOpen(true)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full ${selectedPriceRange ? 'bg-pink-500' : 'bg-gray-800 hover:bg-pink-500'}`}>料金</button>
                    <button onClick={() => setIdFilterModalOpen(true)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full ${selectedIds.length > 0 ? 'bg-pink-500' : 'bg-gray-800 hover:bg-pink-500'}`}>身分証</button>
                    <button onClick={() => setNumberOfPeopleModalOpen(true)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full ${selectedNumberOfPeople ? 'bg-pink-500' : 'bg-gray-800 hover:bg-pink-500'}`}>人数</button>
                    <button onClick={() => setLocationTypeFilter(locationTypeFilter === 'walk' ? null : 'walk')} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full ${locationTypeFilter === 'walk' ? 'bg-pink-500' : 'bg-gray-800 hover:bg-pink-500'}`}>🚶</button>
                    <button onClick={() => setLocationTypeFilter(locationTypeFilter === 'house' ? null : 'house')} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full ${locationTypeFilter === 'house' ? 'bg-pink-500' : 'bg-gray-800 hover:bg-pink-500'}`}>🏠</button>
                    <button onClick={() => setLateNightFilter(!lateNightFilter)} className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full ${lateNightFilter ? 'bg-pink-500' : 'bg-gray-800 hover:bg-pink-500'}`}>遅い時間帯可</button>
                </div>
            </header>
            <main className="p-4 space-y-3">
                {filteredStores.map(store => (
                    <div key={store.id} className={`relative bg-gray-800 rounded-lg shadow-lg flex items-center p-4 ${store.status === 'unwanted' ? 'opacity-40' : ''}`}>
                        <div className="grow" onClick={() => setSelectedStore(store)}>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold">{store.name}</h2>
                                {store.locationType === 'walk' ? '🚶' : '🏠'} {store.contactType === 'phone' ? '📱' : '❌'}
                            </div>
                            <p className="text-gray-400 text-sm">{store.group} / {store.openingTime} / {store.initialPriceMin === store.initialPriceMax ? `${store.initialPriceMin}円` : `${store.initialPriceMin}円~${store.initialPriceMax}円`} / ~{store.numberOfPeople}人</p>
                            <div className="flex flex-wrap gap-2 mt-2">{store.tags.map(tag => (<span key={tag} className="text-xs bg-gray-700 text-pink-300 px-2 py-1 rounded-full">{tag}</span>))}</div>
                        </div>
                        { customerId &&
                            <div className="flex items-center">
                                <button onClick={() => { setStatusUpdateModal({ isOpen: true, storeId: store.id }) }} className="bg-gray-700 text-white rounded-full p-2 hover:bg-red-500"><X className="w-5 h-5" /></button>
                            </div>
                        }
                         {store.closingDay === today && (<div className="absolute inset-0 bg-black/30 flex justify-center items-center rounded-lg pointer-events-none"><span className="text-white text-xl font-bold transform -rotate-12">定休日</span></div>)}
                    </div>
                ))}
            </main>
            {selectedStore && <StoreDetailScreen store={selectedStore} onClose={() => setSelectedStore(null)} isAdmin={isAdmin} navigateTo={navigateTo}/>}
            {statusUpdateModal.isOpen && <StatusUpdateModal onClose={() => setStatusUpdateModal({ isOpen: false, storeId: null })} onUpdate={(newStatus) => {updateStoreStatus(statusUpdateModal.storeId, newStatus); setStatusUpdateModal({isOpen: false, storeId: null})}} />}
            {idFilterModalOpen && <IdSelectionModal currentSelected={selectedIds} onClose={() => setIdFilterModalOpen(false)} onApply={setSelectedIds} />}
            {groupFilterModalOpen && <GroupSelectionModal groups={allGroups} onClose={() => setGroupFilterModalOpen(false)} onSelect={(group) => { setSelectedGroup(group); setGroupFilterModalOpen(false); }} />}
            {priceFilterModalOpen && <PriceSelectionModal onClose={() => setPriceFilterModalOpen(false)} onSelect={(range) => { setSelectedPriceRange(range); setPriceFilterModalOpen(false); }} />}
            {numberOfPeopleModalOpen && <NumberOfPeopleSelectionModal onClose={() => setNumberOfPeopleModalOpen(false)} onSelect={(option) => { setSelectedNumberOfPeople(option); setNumberOfPeopleModalOpen(false); }} />}
        </div>
    );
}

function StoreDetailScreen({ store, onClose, isAdmin, navigateTo }) {
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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{store.name}</h1>
                        <p className="text-gray-400 text-lg mb-6">{store.group}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button 
                                onClick={() => {
                                    onClose(); 
                                    navigateTo('adminStoreEdit', store);
                                }} 
                                className="p-2 bg-gray-700 rounded-full hover:bg-pink-500"
                                title="この店舗を編集する"
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                    </div>
                </div>
                <main className="space-y-6">
                    <div className="bg-gray-700 p-4 rounded-lg"><h3 className="font-bold text-lg mb-2">基本情報</h3><ul className="space-y-2 text-gray-300"><li><strong>営業時間:</strong> {store.openingTime}</li><li><strong>定休日:</strong> {store.closingDay}</li><li><strong>初回時間:</strong> {store.initialTime}分</li><li><strong>初回料金:</strong> {store.initialPriceMin === store.initialPriceMax ? `${store.initialPriceMin}円` : `${store.initialPriceMin}円~${store.initialPriceMax}円`}</li><li><strong>人数:</strong> ~{store.numberOfPeople}人</li><li><strong>遅い時間帯可:</strong> {store.lateNightOption}</li><li><strong>属性:</strong> {store.locationType === 'walk' ? '🚶' : '🏠'} {store.contactType === 'phone' ? '📱' : '❌'}</li><li><strong>必須本人確認書類:</strong> {store.requiredIds.join(', ')}</li><li className="flex flex-wrap gap-2 items-center"><strong>タグ:</strong> {store.tags.map(tag => (<span key={tag} className="text-xs bg-gray-600 text-pink-300 px-2 py-1 rounded-full">{tag}</span>))}</li></ul></div>
                    <div className="grid grid-cols-2 gap-4"><a href={store.hosuhosuUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"><LinkIcon /> ホスホス</a><a href={store.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"><MapPin /> 地図</a></div>
                    <div className="bg-gray-700 p-4 rounded-lg">{!memoUnlocked && (<button onClick={() => setShowPasswordInput(!showPasswordInput)} className="w-full text-center text-pink-400 font-bold py-2">スタッフ専用メモを見る</button>)}{showPasswordInput && (<div className="mt-4"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="4桁のパスワード" className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white" maxLength="4" /><button onClick={handlePasswordCheck} className="w-full mt-2 bg-pink-600 text-white font-bold py-2 rounded-lg">確認</button></div>)}{memoUnlocked && (<div><h3 className="font-bold text-lg mb-2">スタッフ専用メモ</h3><p className="text-gray-300 whitespace-pre-wrap bg-gray-600 p-3 rounded">{memo}</p><p><strong>バック料金:</strong> {store.backCharge}</p></div>)}</div>
                </main>
            </div>
        </div>
    );
}

function AdminScreen({ navigateTo, isAdmin }) {
    return (
        <div className="p-4">
            <button onClick={() => navigateTo('customerSelection')} className="flex items-center gap-2 mb-4 text-pink-400"><ArrowLeft />トップに戻る</button>
            <h1 className="text-2xl font-bold text-center mb-6">管理者メニュー</h1>
            <div className="space-y-4">
                <button onClick={() => navigateTo('adminStores')} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
                    <h2 className="text-lg font-bold">店舗情報管理</h2>
                    <p className="text-sm text-gray-400">店舗の追加、編集を行います</p>
                </button>
                 <button onClick={() => navigateTo('adminCustomers')} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
                    <h2 className="text-lg font-bold">顧客管理</h2>
                    <p className="text-sm text-gray-400">顧客のメモや利用状況を確認します</p>
                </button>
                {isAdmin && (
                    <button onClick={() => navigateTo('adminStaffManagement')} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
                        <h2 className="text-lg font-bold">外販スタッフユーザー管理</h2>
                        <p className="text-sm text-gray-400">新規スタッフの登録を行います</p>
                    </button>
                )}
            </div>
        </div>
    );
}

function AdminCustomersScreen({ navigateTo, getCustomerCollectionPath, setShareModalData }) {
    const [customers, setCustomers] = useState([]);
    const [toast, setToast] = useState('');
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const customerPath = getCustomerCollectionPath();
            if(customerPath) {
                const customersQuery = query(collection(db, customerPath));
                const querySnapshot = await getDocs(customersQuery);
                const customersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    path: doc.ref.path
                }));
                setCustomers(customersList);
            }
        } catch (error) { console.error("Error fetching customers: ", error); }
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, [getCustomerCollectionPath]);
    
    const handleCreateShareLink = async (customer) => {
        if (!customer) return;
        try {
            const docRef = await addDoc(collection(db, sharedListsCollectionPath), {
                customerPath: customer.path,
                nickname: customer.nickname,
            });
            const baseUrl = window.location.href.split('?')[0];
            const shareUrl = `${baseUrl}?shareId=${docRef.id}`;
            setShareModalData({ isOpen: true, url: shareUrl });

        } catch (error) {
            console.error("Error creating share link: ", error);
            setToast('共有リンクの作成に失敗しました。');
        }
    };

    const copyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; 
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try { 
            document.execCommand('copy'); 
            setToast('IDをコピーしました！');
            setTimeout(() => setToast(''), 2000); 
        } catch (err) { 
            console.error('Failed to copy: ', err); 
            setToast('コピーに失敗しました。');
            setTimeout(() => setToast(''), 2000); 
        }
        document.body.removeChild(textArea);
    };

    const handleDeleteCustomer = async () => {
        if (!customerToDelete) return;
        try {
            await deleteDoc(doc(db, customerToDelete.path));
            setToast(`顧客「${customerToDelete.nickname}」を削除しました。`);
            setCustomers(prev => prev.filter(c => c.path !== customerToDelete.path));
            setCustomerToDelete(null);
        } catch (error) {
            console.error("Error deleting customer: ", error);
            setToast('顧客の削除に失敗しました。');
        }
    };

    if (loading) return <div className="text-center p-10">顧客情報を読み込み中...</div>

    return (
        <div className="p-4">
            {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">{toast}</div>}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigateTo('admin')} className="flex items-center gap-2 text-pink-400"><ArrowLeft />管理メニュー</button>
                <h1 className="text-2xl font-bold">顧客管理</h1>
                <div className="w-16"></div>
            </div>
            <div className="space-y-3">
                {customers.map(customer => (
                    <div key={customer.path} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                        <div onClick={() => navigateTo('adminCustomerDetail', { path: customer.path })} className="cursor-pointer grow">
                            <p className="font-bold">{customer.nickname}</p>
                            <p className="text-xs text-gray-400 truncate">ID: {customer.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => copyToClipboard(customer.id)} className="p-2 bg-gray-700 rounded-full hover:bg-pink-500" title="顧客IDをコピー"><Clipboard className="w-5 h-5" /></button>
                            <button onClick={() => handleCreateShareLink(customer)} className="p-2 bg-gray-700 rounded-full hover:bg-blue-500" title="共有リンクを作成"><Share2 className="w-5 h-5" /></button>
                            <button onClick={() => setCustomerToDelete(customer)} className="p-2 bg-gray-700 rounded-full hover:bg-red-500" title="顧客を削除"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmationModal
                isOpen={!!customerToDelete}
                onClose={() => setCustomerToDelete(null)}
                onConfirm={handleDeleteCustomer}
                title="顧客の削除"
                message={`本当に顧客「${customerToDelete?.nickname}」を削除しますか？`}
            />
        </div>
    );
}
function AdminCustomerDetailScreen({ customerInfo, navigateTo, setShareModalData }) {
    const [customer, setCustomer] = useState(null);
    const [allStores, setAllStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [storeSearchTerm, setStoreSearchTerm] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            if (!customerInfo || !customerInfo.path) return;
            setLoading(true);
            try {
                const storesSnapshot = await getDocs(collection(db, storeCollectionPath));
                setAllStores(storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                const docRef = doc(db, customerInfo.path);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCustomer(docSnap.data());
                }
            } catch (error) { console.error("Error fetching customer details: ", error); }
            setLoading(false);
        };
        fetchAllData();
    }, [customerInfo]);

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, customerInfo.path), customer);
            setToast('保存しました！'); setTimeout(() => setToast(''), 2000);
        } catch (error) {
            console.error("Error saving customer data: ", error);
            setToast('保存に失敗しました。');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, customerInfo.path));
            setIsDeleteModalOpen(false);
            setToast('顧客を削除しました。');
            setTimeout(() => navigateTo('adminCustomers'), 1500);
        } catch (error) {
            console.error("Error deleting customer: ", error);
            setToast('削除に失敗しました。');
        }
    };
    
    const handleCreateShareLink = async () => {
        if (!customer) return;
        const visitedStoreIds = customer.storeStatuses.filter(s => s.status === 'visited').map(s => s.storeId);
        if (visitedStoreIds.length === 0) {
            setToast('行ったことのあるお店がありません。');
            setTimeout(() => setToast(''), 2000);
            return;
        }
        try {
            const docRef = await addDoc(collection(db, sharedListsCollectionPath), {
                customerPath: customerInfo.path,
                nickname: customer.nickname,
            });
            const baseUrl = window.location.href.split('?')[0];
            const shareUrl = `${baseUrl}?shareId=${docRef.id}`;
            setShareModalData({ isOpen: true, url: shareUrl });
        } catch (error) {
            console.error("Error creating share link: ", error);
            setToast('共有リンクの作成に失敗しました。');
        }
    };


    const handleNicknameChange = (e) => setCustomer(prev => ({ ...prev, nickname: e.target.value }));
    const handlePreferencesChange = (e) => setCustomer(prev => ({ ...prev, preferences: e.target.value }));

    const handleStoreStatusChange = (storeId, newStatus) => {
        const statuses = customer.storeStatuses || [];
        const existingStatus = statuses.find(s => s.storeId === storeId);
        let newStoreStatuses;
        if (existingStatus) {
            newStoreStatuses = statuses.map(s => s.storeId === storeId ? { ...s, status: newStatus } : s);
        } else {
            newStoreStatuses = [...statuses, { storeId, status: newStatus }];
        }
        setCustomer(prev => ({ ...prev, storeStatuses: newStoreStatuses }));
    };

    const handleIdTypeChange = (idType) => {
        const possessed = customer.possessedIdTypes || [];
        const newIdTypes = possessed.includes(idType) ? possessed.filter(id => id !== idType) : [...possessed, idType];
        setCustomer(prev => ({ ...prev, possessedIdTypes: newIdTypes }));
    };

    if (loading) return <div className="p-4 text-center">顧客情報を読み込み中...</div>;
    if (!customer) return <div className="p-4 text-center">顧客情報が見つかりません。</div>;
    
    const filteredStoresForAdmin = allStores.filter(store => store.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) || (store.phoneticName && store.phoneticName.toLowerCase().includes(storeSearchTerm.toLowerCase())));
    
    return (
        <div className="p-4 pb-24">
            {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg">{toast}</div>}
            <button onClick={() => navigateTo('adminCustomers')} className="flex items-center gap-2 mb-4 text-pink-400"><ArrowLeft />顧客管理に戻る</button>
            <div className="mb-4">
                <label className="text-sm text-gray-400">ニックネーム</label>
                <input type="text" value={customer.nickname || ''} onChange={handleNicknameChange} className="w-full p-2 bg-gray-800 rounded-md mt-1 text-2xl font-bold" />
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">行ったことある店</h2>
                    <button onClick={handleCreateShareLink} className="p-2 bg-blue-600 rounded-full hover:bg-blue-700"><Share2 className="w-5 h-5"/></button>
                </div>
                <input type="text" placeholder="店舗名で検索..." value={storeSearchTerm} onChange={(e) => setStoreSearchTerm(e.target.value)} className="w-full px-4 py-2 bg-gray-700 rounded-full mb-4" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {filteredStoresForAdmin.map(store => (
                        <label key={store.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded-md">
                            <input type="checkbox" checked={customer.storeStatuses?.some(s => s.storeId === store.id && s.status === 'visited')} onChange={() => handleStoreStatusChange(store.id, customer.storeStatuses?.some(s => s.storeId === store.id && s.status === 'visited') ? 'active' : 'visited')} className="form-checkbox bg-gray-700 text-pink-500" />
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
                            <input type="checkbox" checked={customer.possessedIdTypes?.includes(idType)} onChange={() => handleIdTypeChange(idType)} className="form-checkbox bg-gray-700 text-pink-500" />
                            <span>{idType}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="font-bold text-lg mb-2">お店の好み（メモ）</h2>
                <textarea value={customer.preferences || ''} onChange={handlePreferencesChange} className="w-full h-32 p-2 bg-gray-700 rounded-md text-white"></textarea>
            </div>
            <div className="mt-6 space-y-3">
                 <button onClick={handleSave} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg">保存</button>
                 <button onClick={() => setIsDeleteModalOpen(true)} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg">この顧客を削除する</button>
            </div>
            
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} title="顧客の削除" message={`本当に顧客「${customer.nickname}」を削除しますか？`} />
        </div>
    );
}

function AdminStaffManagementScreen({ navigateTo }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [staffList, setStaffList] = useState([]);

    const fetchStaff = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, staffsCollectionPath));
            const staff = querySnapshot.docs.map(doc => doc.data());
            setStaffList(staff);
        } catch (err) {
            console.error("Error fetching staff list:", err);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);


    const handleRegister = async () => {
        setError(''); setSuccess('');
        if (masterPassword !== 'White1221') {
            setError('マスターパスワードが正しくありません。');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, staffsCollectionPath, user.uid), {
                email: user.email,
                uid: user.uid,
                createdAt: new Date(),
            });

            setSuccess('新しいスタッフを登録しました。');
            setEmail(''); setPassword(''); setMasterPassword('');
            fetchStaff();
        } catch (e) {
            setError('スタッフの登録に失敗しました。' + e.message);
            console.error(e);
        }
    };

    return (
        <div className="p-4">
            <button onClick={() => navigateTo('admin')} className="flex items-center gap-2 mb-4 text-pink-400"><ArrowLeft />管理メニューに戻る</button>
            <h1 className="text-2xl font-bold text-center mb-6">新規スタッフ登録</h1>
            <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" className="w-full p-2 bg-gray-700 rounded-md" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" className="w-full p-2 bg-gray-700 rounded-md" />
                <input type="password" value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} placeholder="マスターパスワード" className="w-full p-2 bg-gray-700 rounded-md" />
                <button onClick={handleRegister} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg">登録する</button>
                {error && <p className="text-red-500 text-center">{error}</p>}
                {success && <p className="text-green-500 text-center">{success}</p>}
            </div>
             <div className="mt-8">
                <h2 className="text-xl font-bold text-center mb-4">既存スタッフ一覧</h2>
                <div className="bg-gray-800 p-4 rounded-lg space-y-2">
                    {staffList.map(staff => (
                        <div key={staff.uid} className="p-2 bg-gray-700 rounded">
                            <p>{staff.email}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AdminStoresScreen({ navigateTo }) {
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
    const [formData, setFormData] = useState({ name: '', group: '', phoneticName: '', openingTime: '', initialTime: '', closingDay: '', lateNightOption: '不可', initialPriceMin: '', initialPriceMax: '', backCharge: '', tags: '', requiredIds: [], hosuhosuUrl: '', mapUrl: '', staffMemo: '', numberOfPeople: 1, locationType: 'walk', contactType: 'phone' });
    const [hasPriceRange, setHasPriceRange] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (store) {
            const isRange = store.initialPriceMin !== store.initialPriceMax;
            setHasPriceRange(isRange);
            setFormData({ 
                ...store, 
                phoneticName: store.phoneticName || '',
                openingTime: store.openingTime || '',
                initialTime: store.initialTime || '',
                closingDay: store.closingDay || '',
                lateNightOption: store.lateNightOption || '不可',
                tags: store.tags.join(', '), 
                requiredIds: store.requiredIds || [],
                initialPriceMin: store.initialPriceMin || '',
                initialPriceMax: isRange ? (store.initialPriceMax || '') : '',
                numberOfPeople: store.numberOfPeople || 1,
                locationType: store.locationType || 'walk',
                contactType: store.contactType || 'phone'
            });
        }
    }, [store]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleIdChange = (id) => {
        setFormData(prev => {
            const newIds = prev.requiredIds.includes(id) ? prev.filter(i => i !== id) : [...prev.requiredIds, id];
            return { ...prev, requiredIds: newIds };
        });
    };

    const handleAttributeChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const minPrice = Number(formData.initialPriceMin) || 0;
        const maxPrice = hasPriceRange ? (Number(formData.initialPriceMax) || minPrice) : minPrice;

        const dataToSave = {
            ...formData,
            initialPriceMin: minPrice,
            initialPriceMax: maxPrice,
            initialPriceText: hasPriceRange ? `${minPrice}円~${maxPrice}円` : `${minPrice}円`,
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
            numberOfPeople: Number(formData.numberOfPeople) || 1,
            initialTime: Number(formData.initialTime) || 0
        };
        
        try {
            if (store) {
                await setDoc(doc(db, storeCollectionPath, store.id), dataToSave);
            } else {
                await addDoc(collection(db, storeCollectionPath), dataToSave);
            }
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
                    <div className="flex gap-2 mt-1">
                        {lateNightOptions.map(option => (
                            <button key={option.value} onClick={() => handleAttributeChange('lateNightOption', option.value)} className={`px-4 py-2 rounded-full text-sm ${formData.lateNightOption === option.value ? 'bg-pink-500' : 'bg-gray-700'}`}>{option.label}</button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                        <input type="checkbox" checked={hasPriceRange} onChange={(e) => setHasPriceRange(e.target.checked)} className="form-checkbox bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"/>
                        <span>料金に差がある</span>
                    </label>
                </div>

                {hasPriceRange ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm text-gray-400">最低料金 (円)</label><input type="number" name="initialPriceMin" value={formData.initialPriceMin} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                        <div><label className="text-sm text-gray-400">最高料金 (円)</label><input type="number" name="initialPriceMax" value={formData.initialPriceMax} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                    </div>
                ) : (
                    <div><label className="text-sm text-gray-400">初回料金 (円)</label><input type="number" name="initialPriceMin" value={formData.initialPriceMin} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                )}

                <div><label className="text-sm text-gray-400">バック料金</label><input type="text" name="backCharge" value={formData.backCharge} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">タグ (カンマ区切り)</label><input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div>
                    <label className="text-sm text-gray-400">人数</label>
                    <select name="numberOfPeople" value={formData.numberOfPeople} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1">
                        {numberOfPeopleOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
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
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {idTypes.map(id => (
                            <label key={id} className="flex items-center gap-2 p-2 bg-gray-800 rounded-md">
                                <input type="checkbox" checked={formData.requiredIds.includes(id)} onChange={() => handleIdChange(id)} className="form-checkbox bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"/>
                                <span>{id}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div><label className="text-sm text-gray-400">ホスホスURL</label><input type="url" name="hosuhosuUrl" value={formData.hosuhosuUrl} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">地図URL</label><input type="url" name="mapUrl" value={formData.mapUrl} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md mt-1" /></div>
                <div><label className="text-sm text-gray-400">スタッフ専用メモ</label><textarea name="staffMemo" value={formData.staffMemo} onChange={handleChange} className="w-full h-24 p-2 bg-gray-800 rounded-md mt-1"></textarea></div>
                <button onClick={handleSave} className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg">保存する</button>
            </div>
        </div>
    );
}

function SharedListScreen({ shareId }) {
    const [sharedData, setSharedData] = useState(null);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState('');

    useEffect(() => {
        if (!shareId) return;

        const shareDocRef = doc(db, sharedListsCollectionPath, shareId);
        
        const unsubscribe = onSnapshot(shareDocRef, async (shareSnap) => {
            if (shareSnap.exists()) {
                const shareData = shareSnap.data();
                setCustomerName(shareData.nickname);

                const customerDocRef = doc(db, shareData.customerPath);
                onSnapshot(customerDocRef, async (customerSnap) => {
                    if (customerSnap.exists()) {
                         const customerData = customerSnap.data();
                         const visitedStoreIds = customerData.storeStatuses
                            .filter(s => s.status === 'visited')
                            .map(s => s.storeId);
                        
                        if (visitedStoreIds.length > 0) {
                            const storesQuery = query(collection(db, storeCollectionPath), where('__name__', 'in', visitedStoreIds));
                            const querySnapshot = await getDocs(storesQuery);
                            const storesData = querySnapshot.docs.map(d => ({id: d.id, ...d.data()}));
                            setStores(storesData);
                        } else {
                            setStores([]);
                        }
                    }
                     setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();

    }, [shareId]);

    if (loading) return <div className="text-center p-10">読み込み中...</div>;
    if (!customerName) return <div className="text-center p-10">共有リストが見つかりません。</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-center mb-6">{customerName}さんの行ったお店リスト</h1>
            <div className="space-y-3">
                 {stores.length > 0 ? stores.map(store => (
                    <div key={store.id} className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-lg font-bold">{store.name}</h2>
                        <p className="text-sm text-gray-400">{store.group}</p>
                        <div className="flex flex-wrap gap-2 mt-2">{store.tags.map(tag => (<span key={tag} className="text-xs bg-gray-700 text-pink-300 px-2 py-1 rounded-full">{tag}</span>))}</div>
                    </div>
                )) : <p className="text-center text-gray-400">まだ行ったお店はありません。</p>}
            </div>
        </div>
    );
}
// --- Modals and Bottom Nav ---
function BottomNavBar({ currentFilter, setFilter, onLogout }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 max-w-lg mx-auto h-20 flex items-center justify-around px-4">
            <button onClick={() => setFilter('visited')} className={`flex flex-col items-center justify-center w-24 h-full ${currentFilter === 'visited' ? 'text-pink-400' : 'text-gray-400'}`}><CheckSquare className="w-7 h-7 mb-1" /><span className="text-xs">行った店</span></button>
            <button onClick={() => setFilter('all')} className={`flex items-center justify-center w-20 h-20 -mt-8 rounded-full shadow-lg ${currentFilter === 'all' ? 'bg-pink-600' : 'bg-gray-700'}`}><Home className="w-9 h-9 text-white" /></button>
            <button onClick={onLogout} className="flex flex-col items-center justify-center w-24 h-full text-gray-400"><ArrowLeft className="w-7 h-7 mb-1" /><span className="text-xs">顧客選択へ</span></button>
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
    const toggleId = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
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

function ShareModal({ url, onClose }) {
    const [copySuccess, setCopySuccess] = useState('');

    const copyToClipboard = (textToCopy) => {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed"; 
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopySuccess('コピーしました！');
        } catch (err) {
            setCopySuccess('コピーに失敗しました。');
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-lg text-center mb-4">共有リンク</h3>
                <div className="flex items-center space-x-2">
                    <input type="text" value={url} readOnly className="w-full p-2 bg-gray-700 rounded-md text-white border border-gray-600" />
                    <button onClick={() => copyToClipboard(url)} className="p-2 bg-pink-600 rounded-md hover:bg-pink-700"><Clipboard className="w-5 h-5"/></button>
                </div>
                {copySuccess && <p className="text-center text-green-400 mt-2">{copySuccess}</p>}
                <button onClick={onClose} className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg">閉じる</button>
            </div>
        </div>
    );
}
export default App;

