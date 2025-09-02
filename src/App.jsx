import React, { useState, useEffect, useMemo } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, getDocs, writeBatch, deleteDoc, collectionGroup } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// --- Icon Components (変更なし) ---
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
const Share2 = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>);


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
const storeCollectionPath = `artifacts/${appId}/public/data/stores`;
const sharedListsCollectionPath = `artifacts/${appId}/public/data/sharedLists`;


// --- Constant Data (変更なし) ---
const idTypes = ["運転免許証", "マイナンバー", "パスポート", "保険証", "キャッシュカード", "クレジットカード"];
const priceFilterRanges = [
    { label: "無料", min: 0, max: 0 },
    { label: "~1000円", min: 1, max: 1000 },
    { label: "~2000円", min: 1001, max: 2000 },
    { label: "~3000円", min: 2001, max: 3000 },
    { label: "~5000円", min: 3001, max: 5000 },
    { label: "~10000円", min: 5001, max: 10000 }
];
const numberOfPeopleOptions = [
    { label: "~1人", value: 1 },
    { label: "~2人", value: 2 },
    { label: "~3人", value: 3 },
    { label: "~4人", value: 4 }
];
const lateNightOptions = [
    { label: "不可", value: "不可" },
    { label: "23:30~", value: "23:30~" },
    { label: "23:45~", value: "23:45~" }
];

const initialStoresData = [
    { id: 'store1', name: 'Club AIR', group: 'AIR GROUP', phoneticName: 'くらぶえあー', openingTime: '19:00', initialTime: 60, closingDay: '日曜日', lateNightOption: '23:30~', initialPriceText: '3000円', initialPriceMin: 3000, initialPriceMax: 3000, backCharge: 'T/C 3000円', requiredIds: ['運転免許証', 'パスポート'], tags: ['#イケメン揃い', '#初回安い'], hosuhosuUrl: '#', mapUrl: '#', staffMemo: '担当Aはシャンパンが好き。', numberOfPeople: 2, locationType: 'walk', contactType: 'phone' },
    { id: 'store2', name: 'TOP DANDY', group: 'groupdandy', phoneticName: 'とっぷだんでぃ', openingTime: '20:00', initialTime: 90, closingDay: '月曜日', lateNightOption: '23:45~', initialPriceText: '5000円', initialPriceMin: 5000, initialPriceMax: 5000, backCharge: 'T/C 4000円', requiredIds: ['運転免許証', 'マイナンバー'], tags: ['#老舗', '#落ち着いた雰囲気'], hosuhosuUrl: '#', mapUrl: '#', staffMemo: '新人Bはトークが上手い。', numberOfPeople: 4, locationType: 'house', contactType: 'phone' },
    { id: 'store3', name: 'Lillion', group: 'Lillion', phoneticName: 'りりおん', openingTime: '18:00', initialTime: 120, closingDay: 'なし', lateNightOption: '不可', initialPriceText: '2000円※', initialPriceMin: 1000, initialPriceMax: 2000, backCharge: 'なし', requiredIds: ['運転免許証'], tags: ['#新規店', '#ワイワイ系'], hosuhosuUrl: '#', mapUrl: '#', staffMemo: 'リーダーCは週末混雑を避けたがる。', numberOfPeople: 3, locationType: 'walk', contactType: 'none' },
];

// --- Main App Component ---
function App() {
    const [page, setPage] = useState('login');
    const [listFilter, setListFilter] = useState('all');
    const [customerId, setCustomerId] = useState(null);
    const [customerData, setCustomerData] = useState(null);
    const [adminLoginOpen, setAdminLoginOpen] = useState(false);
    const [selectedAdminCustomerId, setSelectedAdminCustomerId] = useState(null);
    const [editingStore, setEditingStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [today, setToday] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [shareId, setShareId] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('shareId');
        if (id) {
            setShareId(id);
            setPage('sharedList');
        }
    }, []);

    useEffect(() => {
        const date = new Date();
        const days = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
        setToday(days[date.getDay()]);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const tokenResult = await user.getIdTokenResult();
                setIsAdmin(!!tokenResult.claims.admin);
                
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
                    setError("店舗データの初期設定に失敗しました。");
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getCustomerCollectionPath = () => {
        if (!currentUser) return null;
        return `artifacts/${appId}/staffs/${currentUser.uid}/customers`;
    };
    
    const loadCustomerData = async (id) => {
        setError(''); setLoading(true);
        if (!id) { setError("顧客IDが無効です。"); setLoading(false); return; }
        const customerPath = getCustomerCollectionPath();
        if (!customerPath) {setError("ログインしていません。"); setLoading(false); return;}
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
        if (!customerPath) {setError("ログインしていません。"); setLoading(false); return;}

        try {
            const storesSnapshot = await getDocs(collection(db, storeCollectionPath));
            const storeStatuses = storesSnapshot.docs.map(doc => ({ storeId: doc.id, status: 'active' }));
            const newCustomer = { nickname: "新規顧客", storeStatuses, createdAt: new Date(), preferences: "", possessedIdTypes: [] };
            
            const randomPart = Math.random().toString(36).substring(2, 8);
            const newId = `&${randomPart}`;

            const docRef = doc(db, customerPath, newId);
            await setDoc(docRef, newCustomer);
            
            setCustomerData(newCustomer); setCustomerId(newId); setPage('list'); setListFilter('all');
        } catch (e) { console.error("Error creating new customer: ", e); setError("新規顧客の作成に失敗しました。"); }
        setLoading(false);
    };
    
    const viewAsGuest = () => {
        setCustomerId(null);
        setCustomerData(null);
        setPage('list');
    };

    const navigateTo = (targetPage, data = null) => {
        if (targetPage === 'adminCustomerDetail') setSelectedAdminCustomerId(data);
        if (targetPage === 'adminStoreEdit') setEditingStore(data);
        setPage(targetPage);
    };
    const handleLogout = async () => {
        await signOut(auth);
        setCustomerId(null); 
        setCustomerData(null); 
        setCurrentUser(null);
        setIsAdmin(false);
        setPage('login'); 
    };

    const renderPage = () => {
        if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
        if (page === 'sharedList') return <SharedListScreen shareId={shareId} />;
        if (!currentUser) return <LoginScreen setError={setError} error={error}/>

        switch (page) {
            case 'customerSelection': return <CustomerSelectionScreen onSelect={loadCustomerData} onCreate={createNewCustomer} onViewAsGuest={viewAsGuest} setAdminLoginOpen={setAdminLoginOpen} error={error} today={today} handleLogout={handleLogout} isAdmin={isAdmin} navigateTo={navigateTo} />;
            case 'list': return <StoreListScreen customerData={customerData} setCustomerData={setCustomerData} customerId={customerId} navigateTo={navigateTo} listFilter={listFilter} today={today} />;
            case 'admin': return <AdminScreen navigateTo={navigateTo} />;
            case 'adminCustomers': return <AdminCustomersScreen navigateTo={navigateTo} />;
            case 'adminCustomerDetail': return <AdminCustomerDetailScreen customerId={selectedAdminCustomerId} navigateTo={navigateTo} />;
            case 'adminStores': return <AdminStoresScreen navigateTo={navigateTo} />;
            case 'adminStoreEdit': return <AdminStoreEditScreen store={editingStore} navigateTo={navigateTo} />;
            case 'adminStaffManagement': return <AdminStaffManagementScreen navigateTo={navigateTo}/>
            default: return <CustomerSelectionScreen onSelect={loadCustomerData} onCreate={createNewCustomer} onViewAsGuest={viewAsGuest} setAdminLoginOpen={setAdminLoginOpen} error={error} today={today} handleLogout={handleLogout} isAdmin={isAdmin} navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="container mx-auto max-w-lg p-0">
                {renderPage()}
                {adminLoginOpen && <AdminLoginModal onClose={() => setAdminLoginOpen(false)} onLoginSuccess={() => { setAdminLoginOpen(false); setPage('admin'); }} />}
            </div>
            {page === 'list' && customerId && <BottomNavBar currentFilter={listFilter} setFilter={setListFilter} onLogout={() => setPage('customerSelection')}/>}
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
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" className="w-full mb-4 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors" />
                <button onClick={handleLogin} className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">ログイン</button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}

function CustomerSelectionScreen({ onSelect, onCreate, onViewAsGuest, setAdminLoginOpen, error, today, handleLogout, isAdmin, navigateTo }) {
    const [inputId, setInputId] = useState('');
    return (
        <div className="flex flex-col justify-center items-center h-screen p-6 bg-gray-900">
            <div className="absolute top-5 bg-blue-500 text-white text-center p-2 rounded-lg">本日は{today}です</div>
            <h1 className="text-4xl font-bold text-pink-400 mb-2">Host-Manager</h1>
            <p className="text-gray-400 mb-8">顧客IDを入力または新規作成してください</p>
            <div className="w-full max-w-sm">
                <input type="text" value={inputId} onChange={(e) => setInputId(e.target.value)} placeholder="顧客ID" className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors" />
                <button onClick={() => onSelect(inputId)} className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">表示</button>
            </div>
            <div className="my-6 text-gray-500">または</div>
            <button onClick={onCreate} className="w-full max-w-sm bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">新規顧客IDを発行</button>
            <button onClick={onViewAsGuest} className="w-full max-w-sm mt-4 border-2 border-pink-500 text-pink-500 font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">店舗一覧を見る</button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <div className="absolute bottom-6 right-6 flex items-center gap-4">
                {isAdmin && <button onClick={() => navigateTo('admin')} className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors"><Shield className="w-5 h-5" />管理者</button>}
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors"><LogOut className="w-5 h-5" />ログアウト</button>
            </div>
        </div>
    );
}
// StoreListScreen, StoreDetailScreen... etc. (他のコンポーネントは変更が少ないため省略)
// ... (AdminScreen, AdminStoresScreen, AdminStoreEditScreenは変更なし)

// 共有リスト表示画面
function SharedListScreen({ shareId }) {
    const [sharedData, setSharedData] = useState(null);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSharedData = async () => {
            try {
                const docRef = doc(db, sharedListsCollectionPath, shareId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSharedData(data);
                    
                    if (data.visitedStoreIds && data.visitedStoreIds.length > 0) {
                        const storesData = [];
                        for (const storeId of data.visitedStoreIds) {
                            const storeDocRef = doc(db, storeCollectionPath, storeId);
                            const storeDocSnap = await getDoc(storeDocRef);
                            if (storeDocSnap.exists()) {
                                storesData.push({ id: storeDocSnap.id, ...storeDocSnap.data() });
                            }
                        }
                        setStores(storesData);
                    }
                }
            } catch (error) {
                console.error("Error fetching shared list:", error);
            }
            setLoading(false);
        };
        fetchSharedData();
    }, [shareId]);

    if (loading) {
        return <div className="text-center p-10">読み込み中...</div>;
    }
    if (!sharedData) {
        return <div className="text-center p-10">共有リストが見つかりません。</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-center mb-6">{sharedData.nickname}さんの行ったお店リスト</h1>
            <div className="space-y-3">
                {stores.map(store => (
                    <div key={store.id} className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-lg font-bold">{store.name}</h2>
                        <p className="text-sm text-gray-400">{store.group}</p>
                        <div className="flex flex-wrap gap-2 mt-2">{store.tags.map(tag => (<span key={tag} className="text-xs bg-gray-700 text-pink-300 px-2 py-1 rounded-full">{tag}</span>))}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}


function AdminCustomersScreen({ navigateTo }) {
    const [customers, setCustomers] = useState([]);
    const [toast, setToast] = useState('');
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const customersQuery = query(collectionGroup(db, 'customers'));
            const querySnapshot = await getDocs(customersQuery);
            const customersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                path: doc.ref.path 
            }));
            setCustomers(customersList);
        } catch (error) { console.error("Error fetching customers: ", error); }
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setToast('IDをコピーしました！');
            setTimeout(() => setToast(''), 2000);
        });
    };
    
    const handleDeleteCustomer = async () => {
        if (!customerToDelete) return;
        try {
            await deleteDoc(doc(db, customerToDelete.path));
            setToast(`顧客「${customerToDelete.nickname}」を削除しました。`);
            setCustomerToDelete(null);
            fetchCustomers();
        } catch (error) {
            console.error("Error deleting customer: ", error);
            setToast('顧客の削除に失敗しました。');
        }
        setTimeout(() => setToast(''), 3000);
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
                    <div key={customer.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                        <div onClick={() => navigateTo('adminCustomerDetail', {id: customer.id, path: customer.path})} className="cursor-pointer grow">
                            <p className="font-bold">{customer.nickname}</p>
                            <p className="text-xs text-gray-400 truncate">ID: {customer.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => copyToClipboard(customer.id)} className="p-2 bg-gray-700 rounded-full hover:bg-pink-500"><Clipboard className="w-5 h-5" /></button>
                            <button onClick={() => setCustomerToDelete(customer)} className="p-2 bg-gray-700 rounded-full hover:bg-red-500"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmationModal 
                isOpen={!!customerToDelete}
                onClose={() => setCustomerToDelete(null)}
                onConfirm={handleDeleteCustomer}
                title="顧客の削除"
                message={`本当に顧客「${customerToDelete?.nickname}」を削除しますか？この操作は元に戻せません。`}
            />
        </div>
    );
}

function AdminCustomerDetailScreen({ customerId, navigateTo }) {
    const [customer, setCustomer] = useState(null);
    const [allStores, setAllStores] = useState([]);
    const [preferences, setPreferences] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [storeSearchTerm, setStoreSearchTerm] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            if (!customerId || !customerId.path) return;
            setLoading(true);
            try {
                const storesSnapshot = await getDocs(collection(db, storeCollectionPath));
                const storesData = storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllStores(storesData);
                const docRef = doc(db, customerId.path);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCustomer(data);
                    setPreferences(data.preferences || '');
                    setNickname(data.nickname || '');
                }
            } catch (error) { console.error("Error fetching customer details: ", error); }
            setLoading(false);
        };
        fetchAllData();
    }, [customerId]);
    
    const handleCreateShareLink = async () => {
        if (!customer) return;
        
        const visitedStoreIds = customer.storeStatuses
            .filter(s => s.status === 'visited')
            .map(s => s.storeId);
            
        if (visitedStoreIds.length === 0) {
            setToast('行ったことのあるお店がありません。');
            setTimeout(() => setToast(''), 2000);
            return;
        }

        try {
            const sharedListData = {
                nickname: customer.nickname,
                visitedStoreIds: visitedStoreIds,
                createdAt: new Date(),
            };
            const docRef = await addDoc(collection(db, sharedListsCollectionPath), sharedListData);
            const shareUrl = `${window.location.origin}?shareId=${docRef.id}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                setToast('共有リンクをクリップボードにコピーしました！');
                setTimeout(() => setToast(''), 3000);
            });
        } catch (error) {
            console.error("Error creating share link: ", error);
            setToast('共有リンクの作成に失敗しました。');
            setTimeout(() => setToast(''), 2000);
        }
    };


    const handleSave = async () => {
        try {
            const customerRef = doc(db, customerId.path);
            await updateDoc(customerRef, { 
                preferences: preferences,
                nickname: nickname,
                storeStatuses: customer.storeStatuses,
                possessedIdTypes: customer.possessedIdTypes,
            });
            setToast('保存しました！'); setTimeout(() => setToast(''), 2000);
        } catch (error) {
            console.error("Error saving customer data: ", error);
            setToast('保存に失敗しました。'); setTimeout(() => setToast(''), 2000);
        }
    };
    
    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, customerId.path));
            setIsDeleteModalOpen(false);
            setToast('顧客を削除しました。');
            setTimeout(() => navigateTo('adminCustomers'), 1500);
        } catch (error) {
            console.error("Error deleting customer: ", error);
            setToast('削除に失敗しました。');
            setTimeout(() => setToast(''), 2000);
        }
    };

    const handleStoreStatusChange = (storeId, newStatus) => {
	let newStoreStatuses = [];
	if (customer.storeStatuses.some(s => s.storeId === storeId)) {
	  newStoreStatuses = customer.storeStatuses.map(s =>
	    s.storeId === storeId ? { ...s, status: newStatus } : s
	  );
	} else {
	    newStoreStatuses = [...customer.storeStatuses, { storeId, status: newStatus }];
	}
	  setCustomer(prev => ({ ...prev, storeStatuses: newStoreStatuses }));
    };

    const handleIdTypeChange = (idType) => {
        const possessedIdTypes = customer.possessedIdTypes || [];
        const newIdTypes = possessedIdTypes.includes(idType)
            ? possessedIdTypes.filter(id => id !== idType)
            : [...possessedIdTypes, idType];
        setCustomer(prev => ({ ...prev, possessedIdTypes: newIdTypes }));
    };

    if (loading) return <div className="p-4 text-center">顧客情報を読み込み中...</div>;
    if (!customer) return <div className="p-4 text-center">顧客情報が見つかりません。</div>;

    const filteredStoresForAdmin = allStores.filter(store => store.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) || (store.phoneticName && store.phoneticName.toLowerCase().includes(storeSearchTerm.toLowerCase())));

    return (
        <div className="p-4 pb-24">
            {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">{toast}</div>}
            <button onClick={() => navigateTo('adminCustomers')} className="flex items-center gap-2 mb-4 text-pink-400"><ArrowLeft />顧客管理に戻る</button>
            
            <div className="mb-4">
                <label className="text-sm text-gray-400">ニックネーム</label>
                <input 
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full p-2 bg-gray-800 rounded-md mt-1 text-2xl font-bold"
                />
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">行ったことある店</h2>
                    <button onClick={handleCreateShareLink} className="p-2 bg-blue-600 rounded-full hover:bg-blue-700"><Share2 className="w-5 h-5"/></button>
                </div>

                <input
                    type="text"
                    placeholder="店舗名で検索..."
                    value={storeSearchTerm}
                    onChange={(e) => setStoreSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 mb-4"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {filteredStoresForAdmin.map(store => (
                        <label key={store.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded-md">
                            <input
                                type="checkbox"
                                checked={customer.storeStatuses.some(s => s.storeId === store.id && s.status === 'visited')}
                                onChange={() => handleStoreStatusChange(store.id, customer.storeStatuses.some(s => s.storeId === store.id && s.status === 'visited') ? 'active' : 'visited')}
                                className="form-checkbox bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"
                            />
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
                            <input
                                type="checkbox"
                                checked={customer.possessedIdTypes?.includes(idType)}
                                onChange={() => handleIdTypeChange(idType)}
                                className="form-checkbox bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-500"
                            />
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
                 <button onClick={() => setIsDeleteModalOpen(true)} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg">この顧客を削除する</button>
            </div>
            
            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="顧客の削除"
                message={`本当に顧客「${nickname}」を削除しますか？この操作は元に戻せません。`}
            />
        </div>
    );
}

function AdminStaffManagementScreen({ navigateTo }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async () => {
        setError('');
        setSuccess('');
        if (masterPassword !== 'MASTER_PASSWORD') { // Replace with your actual master password
            setError('マスターパスワードが正しくありません。');
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setSuccess('新しいスタッフを登録しました。');
            setEmail('');
            setPassword('');
            setMasterPassword('');
        } catch (e) {
            setError('スタッフの登録に失敗しました。' + e.message);
            console.error(e);
        }
    };

    return (
        <div className="p-4">
            <button onClick={() => navigateTo('admin')} className="flex items-center gap-2 mb-4 text-pink-400"><ArrowLeft />管理メニューに戻る</button>
            <h1 className="text-2xl font-bold text-center mb-6">新規スタッフ登録</h1>
            <div className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" className="w-full p-2 bg-gray-800 rounded-md" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" className="w-full p-2 bg-gray-800 rounded-md" />
                <input type="password" value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} placeholder="マスターパスワード" className="w-full p-2 bg-gray-800 rounded-md" />
                <button onClick={handleRegister} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg">登録する</button>
                {error && <p className="text-red-500 text-center">{error}</p>}
                {success && <p className="text-green-500 text-center">{success}</p>}
            </div>
        </div>
    );
}
// AdminScreenにスタッフ管理へのボタン追加
function AdminScreen({ navigateTo }) {
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
                <button onClick={() => navigateTo('adminStaffManagement')} className="w-full p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700">
                    <h2 className="text-lg font-bold">スタッフ管理</h2>
                    <p className="text-sm text-gray-400">新規スタッフの登録を行います</p>
                </button>
            </div>
        </div>
    );
}


export default App;