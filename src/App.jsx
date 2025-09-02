import React, { useEffect, useMemo, useRef, useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  getDocs,
  writeBatch,
  deleteDoc,
  where,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

/*********************************
 * Firebase Setup
 *********************************/
const firebaseConfig = {
  apiKey: "AIzaSyBDXaOWBwJ2-go5e7wGV-ovD4S3Et-E2GY",
  authDomain: "shima-tool.firebaseapp.com",
  projectId: "shima-tool",
  storageBucket: "shima-tool.firebasestorage.app",
  messagingSenderId: "1047021803924",
  appId: "1:1047021803924:web:ed63eb1dff81707d8dd781",
  measurementId: "G-9GE47W77ZR",
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const customerCollectionPath = `artifacts/${appId}/public/data/customers`;
const storeCollectionPath = `artifacts/${appId}/public/data/stores`;
const staffCollectionPath = `artifacts/${appId}/public/data/staffs`; // STAFF 管理用

/*********************************
 * Utilities
 *********************************/
const dayNames = [
  "日曜日",
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
];
const todayName = () => dayNames[new Date().getDay()];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MASTER_PASSWORD = "White1221"; // 指定されたマスターパスワード（クライアント側チェック）

/*********************************
 * Root App
 *********************************/
export default function App() {
  const [page, setPage] = useState("staffLogin");
  const [staffUser, setStaffUser] = useState(null);
  const [staffMeta, setStaffMeta] = useState(null); // { email, isAdmin, allowed }
  const [error, setError] = useState("");
  const [weekday, setWeekday] = useState(todayName());

  // customer/session state
  const [customerId, setCustomerId] = useState(null);
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => setWeekday(todayName()), []);

  // Auth state watcher: validate that the signed-in user is registered in staffs collection and allowed
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setError("");
      if (!u) {
        setStaffUser(null);
        setStaffMeta(null);
        setPage("staffLogin");
        return;
      }
      // fetch staff doc
      try {
        const staffRef = doc(db, staffCollectionPath, u.uid);
        const staffSnap = await getDoc(staffRef);
        if (!staffSnap.exists()) {
          // Not in staff DB -> sign out and show message
          await signOut(auth);
          setStaffUser(null);
          setStaffMeta(null);
          setError("スタッフ登録が確認できません。管理者にお問い合わせください。");
          setPage("staffLogin");
          return;
        }
        const meta = staffSnap.data();
        if (meta.allowed === false) {
          await signOut(auth);
          setStaffUser(null);
          setStaffMeta(null);
          setError("アカウントの利用が停止されています。管理者にお問い合わせください。");
          setPage("staffLogin");
          return;
        }
        setStaffUser(u);
        setStaffMeta({ email: meta.email, isAdmin: !!meta.isAdmin, allowed: meta.allowed !== false });
        // move to customer login screen if currently on login
        if (page === "staffLogin" || page === "staffRegister") setPage("customerLogin");
      } catch (e) {
        console.error("Auth state check failed:", e);
        setError("認証情報の取得に失敗しました。");
        await signOut(auth);
        setStaffUser(null);
        setStaffMeta(null);
        setPage("staffLogin");
      }
    });
    return () => unsub();
  }, [page]);

  // --- staff auth handlers ---
  const handleStaffLogin = async (email, password) => {
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will validate staff doc and navigate
      console.log("signed in:", cred.user.uid);
    } catch (e) {
      console.error(e);
      if (e.code === "auth/user-not-found") setError("このメールアドレスは登録されていません。");
      else if (e.code === "auth/wrong-password") setError("パスワードが間違っています。");
      else if (e.code === "auth/too-many-requests") setError("ログイン試行が多すぎます。しばらくしてから試してください。");
      else setError(e.message || "スタッフログインに失敗しました。");
    }
  };

  const handleStaffRegister = async (email, password, masterPassword) => {
    setError("");
    try {
      if (masterPassword !== MASTER_PASSWORD) {
        setError("マスターパスワードが違います。");
        return;
      }
      // create user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // determine isAdmin: if this is the very first staff, make admin
      let isAdmin = false;
      try {
        const snap = await getDocs(collection(db, staffCollectionPath));
        if (snap.empty) isAdmin = true;
      } catch (e) {
        console.warn("staff list check failed", e);
      }

      // create staff doc
      await setDoc(doc(db, staffCollectionPath, uid), {
        email,
        isAdmin,
        allowed: true,
        createdAt: new Date(),
      });

      // onAuthStateChanged will pick this up and continue
    } catch (e) {
      console.error(e);
      if (e.code === "auth/email-already-in-use") setError("そのメールアドレスは既に使われています。");
      else if (e.code === "auth/weak-password") setError("パスワードは6文字以上にしてください。");
      else if (e.code === "auth/operation-not-allowed") setError("Email/パスワード認証が有効化されていません。Firebase コンソールで有効にしてください。");
      else setError(e.message || "スタッフ登録に失敗しました。");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setStaffUser(null);
    setStaffMeta(null);
    setCustomerId(null);
    setCustomerData(null);
    setPage("staffLogin");
  };

  // --- customer login and creation ---
  const handleCustomerLogin = async (id) => {
    setError("");
    try {
      const ref = doc(db, customerCollectionPath, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setError("顧客IDが見つかりません。");
        return;
      }
      const data = snap.data();
      if (!staffUser || data.assignedStaffId !== staffUser.uid) {
        setError("この顧客はあなたの担当ではありません。");
        return;
      }
      setCustomerId(id);
      setCustomerData(data);
      setPage("list");
    } catch (e) {
      console.error(e);
      setError("顧客ログインに失敗しました。");
    }
  };

  const handleCreateNewCustomer = async () => {
    setError("");
    try {
      const storesSnap = await getDocs(collection(db, storeCollectionPath));
      const storeStatuses = storesSnap.docs.map((d) => ({ storeId: d.id, status: "active" }));
      const newCustomer = {
        nickname: "新規顧客",
        storeStatuses,
        createdAt: new Date(),
        preferences: "",
        possessedIdTypes: [],
        assignedStaffId: staffUser?.uid || null,
      };
      const randomPart = Math.random().toString(36).slice(2, 8);
      const newId = `&${randomPart}`;
      await setDoc(doc(db, customerCollectionPath, newId), newCustomer);
      setCustomerId(newId);
      setCustomerData(newCustomer);
      setPage("list");
    } catch (e) {
      console.error(e);
      setError("新規顧客の作成に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {page === "staffLogin" && (
        <StaffLoginScreen
          weekday={weekday}
          error={error}
          onLogin={handleStaffLogin}
          onSwitch={() => setPage("staffRegister")}
        />
      )}

      {page === "staffRegister" && (
        <StaffRegisterScreen
          error={error}
          onRegister={handleStaffRegister}
          onSwitch={() => setPage("staffLogin")}
        />
      )}

      {page === "customerLogin" && staffUser && (
        <CustomerLoginScreen
          weekday={weekday}
          error={error}
          staffUser={staffUser}
          onLogin={handleCustomerLogin}
          onCreate={handleCreateNewCustomer}
        />
      )}

      {page === "list" && staffUser && staffMeta && customerId && customerData && (
        <StoreShell
          weekday={weekday}
          staffUser={staffUser}
          staffMeta={staffMeta}
          customerId={customerId}
          customerData={customerData}
          setCustomerData={setCustomerData}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

/*********************************
 * Screens — Staff Auth
 *********************************/
function StaffLoginScreen({ weekday, error, onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <div className="absolute top-5 bg-blue-600 text-white px-4 py-1 rounded">本日は{weekday}</div>
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">スタッフログイン</h1>
        <input
          className="mb-2 p-2 w-full text-black rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
        />
        <input
          className="mb-3 p-2 w-full text-black rounded"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
        />
        <button
          className="w-full bg-pink-600 hover:bg-pink-500 transition px-4 py-2 rounded"
          onClick={() => onLogin(email, password)}
        >
          ログイン
        </button>
        <button className="mt-4 text-blue-300" onClick={onSwitch}>
          新規スタッフ登録
        </button>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>
    </div>
  );
}

function StaffRegisterScreen({ error, onRegister, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [master, setMaster] = useState("");
  return (
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">スタッフ新規登録</h1>
        <input
          className="mb-2 p-2 w-full text-black rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
        />
        <input
          className="mb-2 p-2 w-full text-black rounded"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード (6文字以上)"
        />
        <input
          className="mb-3 p-2 w-full text-black rounded"
          type="password"
          value={master}
          onChange={(e) => setMaster(e.target.value)}
          placeholder="マスターパスワード"
        />
        <button
          className="w-full bg-pink-600 hover:bg-pink-500 transition px-4 py-2 rounded"
          onClick={() => onRegister(email, password, master)}
        >
          登録
        </button>
        <button className="mt-4 text-blue-300" onClick={onSwitch}>
          ログイン画面へ戻る
        </button>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        <p className="text-xs text-gray-400 mt-2">注意: マスターパスワードはクライアント側で検証します。セキュリティ上の改良は後述します。</p>
      </div>
    </div>
  );
}

/*********************************
 * Customer Login
 *********************************/
function CustomerLoginScreen({ weekday, error, staffUser, onLogin, onCreate }) {
  const [inputId, setInputId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const q = query(collection(db, customerCollectionPath), where("assignedStaffId", "==", staffUser.uid));
        const snap = await getDocs(q);
        if (!active) return;
        setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => (active = false);
  }, [staffUser?.uid]);

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <div className="sticky top-0 w-full max-w-2xl bg-gray-900/80 backdrop-blur z-10 py-3">
        <div className="text-sm text-gray-300">本日は{weekday}</div>
        <h1 className="text-2xl font-bold">顧客ログイン</h1>
      </div>

      <div className="w-full max-w-2xl mt-4 bg-gray-800 rounded-2xl p-4">
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 rounded text-black"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="顧客IDを入力"
          />
          <button className="px-4 py-2 rounded bg-pink-600 hover:bg-pink-500" onClick={() => onLogin(inputId)}>
            顧客IDでログイン
          </button>
          <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600" onClick={onCreate}>
            新規顧客作成
          </button>
        </div>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      <div className="w-full max-w-2xl mt-6">
        <h2 className="font-bold mb-2">担当顧客一覧</h2>
        {loading ? (
          <div className="text-gray-400">読み込み中...</div>
        ) : customers.length === 0 ? (
          <div className="text-gray-400">担当顧客がいません。新規作成してください。</div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-2">
            {customers.map((c) => (
              <li key={c.id} className="bg-gray-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{c.nickname || "(名称未設定)"}</div>
                  <div className="text-xs text-gray-400">{c.id}</div>
                </div>
                <button className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-sm" onClick={() => onLogin(c.id)}>
                  この顧客で入る
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/*********************************
 * Store Shell (header + admin access)
 *********************************/
function StoreShell({ weekday, staffUser, staffMeta, customerId, customerData, setCustomerData, onLogout }) {
  const [view, setView] = useState({ name: "list", storeId: null });
  const [adminOpen, setAdminOpen] = useState(false);

  const handleEnterDetail = (storeId) => setView({ name: "detail", storeId });
  const handleBackToList = () => setView({ name: "list", storeId: null });

  const updateStoreStatus = async (storeId, nextStatus) => {
    const statuses = Array.isArray(customerData.storeStatuses) ? [...customerData.storeStatuses] : [];
    const idx = statuses.findIndex((s) => s.storeId === storeId);
    if (idx >= 0) statuses[idx] = { ...statuses[idx], status: nextStatus };
    else statuses.push({ storeId, status: nextStatus });

    const next = { ...customerData, storeStatuses: statuses };
    setCustomerData(next);
    try {
      await updateDoc(doc(db, customerCollectionPath, customerId), { storeStatuses: statuses });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto p-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">{weekday}</div>
            <div className="font-semibold">顧客: {customerData?.nickname || customerId}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">{staffUser?.email}</span>
            {staffMeta?.isAdmin && (
              <button className="px-2 py-1 bg-yellow-700 rounded text-sm" onClick={() => setAdminOpen(true)}>
                管理者メニュー
              </button>
            )}
            <button className="text-red-400 hover:text-red-300" onClick={onLogout}>
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}

      {view.name === "list" && (
        <StoreListScreen
          customerData={customerData}
          onToggleVisited={(storeId, visited) => updateStoreStatus(storeId, visited ? "visited" : "active")}
          onOpenDetail={handleEnterDetail}
        />
      )}

      {view.name === "detail" && (
        <StoreDetailScreen storeId={view.storeId} customerData={customerData} onBack={handleBackToList} onMarkVisited={(storeId) => updateStoreStatus(storeId, "visited")} />
      )}
    </div>
  );
}

/*********************************
 * Admin Panel — staff 管理（Firestoreベース）
 * - スタッフ一覧
 * - allowed / isAdmin 切替
 * - パスワード再設定メール送信
 * - スタッフドキュメント削除（権限剥奪）
 *********************************/
function AdminPanel({ onClose }) {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, staffCollectionPath));
        if (!active) return;
        setStaffs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => (active = false);
  }, []);

  const refresh = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, staffCollectionPath));
    setStaffs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const toggleAllowed = async (staffId, now) => {
    try {
      await updateDoc(doc(db, staffCollectionPath, staffId), { allowed: !now });
      setToast("更新しました");
      refresh();
    } catch (e) {
      console.error(e);
      setToast("更新に失敗しました");
    }
  };

  const toggleAdmin = async (staffId, now) => {
    try {
      await updateDoc(doc(db, staffCollectionPath, staffId), { isAdmin: !now });
      setToast("更新しました");
      refresh();
    } catch (e) {
      console.error(e);
      setToast("更新に失敗しました");
    }
  };

  const sendReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setToast("再設定メールを送信しました。");
    } catch (e) {
      console.error(e);
      setToast(e.message || "送信に失敗しました");
    }
  };

  const deleteStaffDoc = async (staffId) => {
    try {
      await deleteDoc(doc(db, staffCollectionPath, staffId));
      setToast("スタッフ権限を削除しました（Firestore）。");
      refresh();
    } catch (e) {
      console.error(e);
      setToast("削除に失敗しました");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-start justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">管理者メニュー（スタッフ管理）</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-gray-700 rounded" onClick={refresh}>更新</button>
            <button className="px-3 py-1 bg-red-600 rounded" onClick={onClose}>閉じる</button>
          </div>
        </div>
        {toast && <div className="mb-2 text-green-400">{toast}</div>}
        {loading ? (
          <div className="text-gray-400">読み込み中...</div>
        ) : staffs.length === 0 ? (
          <div className="text-gray-400">登録スタッフがいません。</div>
        ) : (
          <div className="space-y-2">
            {staffs.map((s) => (
              <div key={s.id} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{s.email || "(no-email)"}</div>
                  <div className="text-xs text-gray-400">uid: {s.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm">Admin: {s.isAdmin ? "✓" : "-"}</div>
                  <button className="px-2 py-1 bg-gray-700 rounded" onClick={() => toggleAdmin(s.id, !!s.isAdmin)}>権限切替</button>
                  <div className="text-sm">Allowed: {s.allowed === false ? "×" : "✓"}</div>
                  <button className="px-2 py-1 bg-gray-700 rounded" onClick={() => toggleAllowed(s.id, s.allowed !== false)}>{s.allowed === false ? "許可する" : "停止する"}</button>
                  <button className="px-2 py-1 bg-blue-700 rounded" onClick={() => sendReset(s.email)}>パスワード再設定</button>
                  <button className="px-2 py-1 bg-red-700 rounded" onClick={() => deleteStaffDoc(s.id)}>Firestore 削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/*********************************
 * Store List + Detail (same as previous full implementation)
 *********************************/
function StoreListScreen({ customerData, onToggleVisited, onOpenDetail }) {
  const [allStores, setAllStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uiPrefs, setUiPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem("storeListUIPrefs:v1");
      return raw ? JSON.parse(raw) : { search: "", sortKey: "name", sortDir: "asc", filterVisited: "all", tagFilters: [] };
    } catch (e) {
      return { search: "", sortKey: "name", sortDir: "asc", filterVisited: "all", tagFilters: [] };
    }
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, storeCollectionPath));
        if (!active) return;
        setAllStores(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => (active = false);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("storeListUIPrefs:v1", JSON.stringify(uiPrefs));
    } catch (_) {}
  }, [uiPrefs]);

  const statusMap = useMemo(() => {
    const m = new Map();
    for (const s of customerData?.storeStatuses || []) m.set(s.storeId, s.status || "active");
    return m;
  }, [customerData?.storeStatuses]);

  const decorated = useMemo(() => allStores.map((s) => ({ ...s, __status: statusMap.get(s.id) || "active" })), [allStores, statusMap]);

  const filtered = useMemo(() => {
    let list = [...decorated];
    const term = (uiPrefs.search || "").trim().toLowerCase();
    if (term) {
      list = list.filter((s) => (s.name || "").toLowerCase().includes(term) || (s.group || "").toLowerCase().includes(term) || (Array.isArray(s.tags) && s.tags.some((t) => (t || "").toLowerCase().includes(term))));
    }
    if (Array.isArray(uiPrefs.tagFilters) && uiPrefs.tagFilters.length) {
      list = list.filter((s) => Array.isArray(s.tags) && uiPrefs.tagFilters.every((tag) => s.tags.includes(tag)));
    }
    if (uiPrefs.filterVisited === "visited") list = list.filter((s) => s.__status === "visited");
    if (uiPrefs.filterVisited === "notVisited") list = list.filter((s) => s.__status !== "visited");
    return list;
  }, [decorated, uiPrefs]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const { sortKey, sortDir } = uiPrefs;
    const dir = sortDir === "desc" ? -1 : 1;
    list.sort((a, b) => {
      const av = (a?.[sortKey] ?? "").toString().toLowerCase();
      const bv = (b?.[sortKey] ?? "").toString().toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }, [filtered, uiPrefs]);

  const allTags = useMemo(() => {
    const bag = new Set();
    for (const s of allStores) (s.tags || []).forEach((t) => bag.add(t));
    return Array.from(bag).sort();
  }, [allStores]);

  return (
    <div className="max-w-5xl mx-auto p-4 pb-24">
      <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
        <div className="flex-1">
          <label className="text-sm text-gray-400">検索</label>
          <input className="w-full p-2 rounded text-black" placeholder="店舗名 / グループ / タグ" value={uiPrefs.search} onChange={(e) => setUiPrefs({ ...uiPrefs, search: e.target.value })} />
        </div>
        <div className="flex gap-2 items-end">
          <div>
            <label className="text-sm text-gray-400 block">ソート</label>
            <select className="p-2 rounded text-black" value={uiPrefs.sortKey} onChange={(e) => setUiPrefs({ ...uiPrefs, sortKey: e.target.value })}>
              <option value="name">店名</option>
              <option value="group">グループ</option>
              <option value="initialPriceText">初回表記</option>
            </select>
          </div>
          <button className="p-2 rounded bg-gray-700" onClick={() => setUiPrefs({ ...uiPrefs, sortDir: uiPrefs.sortDir === "asc" ? "desc" : "asc" })} title="昇順/降順切り替え">{uiPrefs.sortDir === "asc" ? "昇順" : "降順"}</button>
          <div>
            <label className="text-sm text-gray-400 block">訪問フィルタ</label>
            <select className="p-2 rounded text-black" value={uiPrefs.filterVisited} onChange={(e) => setUiPrefs({ ...uiPrefs, filterVisited: e.target.value })}>
              <option value="all">すべて</option>
              <option value="visited">行ったことある</option>
              <option value="notVisited">未訪問</option>
            </select>
          </div>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = uiPrefs.tagFilters.includes(tag);
            return (
              <button key={tag} className={cx("px-2 py-1 rounded text-sm", active ? "bg-pink-600" : "bg-gray-700 hover:bg-gray-600")} onClick={() => setUiPrefs({ ...uiPrefs, tagFilters: active ? uiPrefs.tagFilters.filter((t) => t !== tag) : [...uiPrefs.tagFilters, tag] })} title={active ? "タグを外す" : "タグで絞り込む"}>
                {tag} <span className="opacity-70 ml-1">{active ? "×" : "+"}</span>
              </button>
            );
          })}
          {uiPrefs.tagFilters.length > 0 && (
            <button className="ml-1 px-2 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600" onClick={() => setUiPrefs({ ...uiPrefs, tagFilters: [] })} title="すべてのタグ条件をクリア">すべて解除 ×</button>
          )}
        </div>
      )}

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        {loading && <div className="text-gray-400">読み込み中...</div>}
        {!loading && sorted.length === 0 && <div className="text-gray-400">該当する店舗がありません。</div>}
        {sorted.map((store) => {
          const visited = store.__status === "visited";
          const isClosedToday = (store?.closingDay || "").includes(dayNames[new Date().getDay()]);
          return (
            <div key={store.id} className="bg-gray-800 rounded-2xl p-4 shadow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-lg">{store.name}</div>
                  <div className="text-xs text-gray-400">{store.group}</div>
                </div>
                <button className={cx("px-3 py-1 rounded text-sm", visited ? "bg-green-700" : "bg-gray-700 hover:bg-gray-600")} onClick={() => onToggleVisited(store.id, !visited)} title={visited ? "未訪問に戻す" : "行ったことあるに追加"}>{visited ? "行ったことある✓" : "行ったことあるに追加"}</button>
              </div>

              <div className="mt-2 text-sm">
                <div>営業時間など: {store.openingTime || "-"}</div>
                <div>定休日: {store.closingDay || "-"}{isClosedToday && <span className="ml-2 text-yellow-300">(本日休み)</span>}</div>
                <div>初回: {store.initialPriceText || "-"}</div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">{(store.tags || []).map((t) => (<span key={t} className="text-xs bg-gray-700 px-2 py-1 rounded">{t}</span>))}</div>

              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 text-sm" onClick={() => onOpenDetail(store.id)}>詳細を見る</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StoreDetailScreen({ storeId, customerData, onBack, onMarkVisited }) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const visited = useMemo(() => (customerData?.storeStatuses || []).some((s) => s.storeId === storeId && s.status === "visited"), [customerData?.storeStatuses, storeId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, storeCollectionPath, storeId));
        if (!active) return;
        setStore(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => (active = false);
  }, [storeId]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button className="text-blue-300 hover:text-blue-200" onClick={onBack}>← 一覧に戻る</button>

      {loading && <div className="mt-4 text-gray-400">読み込み中...</div>}
      {!loading && !store && <div className="mt-4 text-red-300">店舗が見つかりません。</div>}

      {store && (
        <div className="mt-4 bg-gray-800 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{store.name}</h1>
              <div className="text-sm text-gray-400">{store.group}</div>
            </div>
            <button className={cx("px-3 py-1 rounded text-sm", visited ? "bg-green-700" : "bg-gray-700 hover:bg-gray-600")} onClick={() => onMarkVisited(store.id)}>{visited ? "行ったことある✓" : "行ったことあるに追加"}</button>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-400">営業時間など</div>
              <div>{store.openingTime || "-"}</div>
            </div>
            <div>
              <div className="text-gray-400">定休日</div>
              <div>{store.closingDay || "-"} <span className="text-xs text-gray-400">(休業日でも詳細は閲覧可能)</span></div>
            </div>
            <div>
              <div className="text-gray-400">初回</div>
              <div>{store.initialPriceText || "-"}</div>
            </div>
            <div>
              <div className="text-gray-400">タグ</div>
              <div className="flex flex-wrap gap-1 mt-1">{(store.tags || []).map((t) => (<span key={t} className="px-2 py-1 rounded bg-gray-700 text-xs">{t}</span>))}</div>
            </div>
          </div>

          {store.description && (<div className="mt-4 whitespace-pre-wrap text-sm leading-6">{store.description}</div>)}
        </div>
      )}
    </div>
  );
}