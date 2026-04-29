"use client";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface UserData {
  uid: string;
  name: string;
  username: string;
  displayName: string;
  email: string;
  plan?: string;
  createdAt?: any;
  lastLogin?: any;
}

export default function UserTable() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("Fetching users from Firestore...");
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      console.log("Users found:", querySnapshot.size);
      const userList: UserData[] = [];
      querySnapshot.forEach((doc) => {
        userList.push({ uid: doc.id, ...doc.data() } as UserData);
      });
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdatePlan = async (uid: string, newPlan: string) => {
    setUpdatingUid(uid);
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { plan: newPlan });
      setUsers(users.map(u => u.uid === uid ? { ...u, plan: newPlan } : u));
    } catch (err) {
      console.error("Error updating plan:", err);
    } finally {
      setUpdatingUid(null);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading users...</div>;

  return (
    <section className="view-section">
      <h1 className="page-title">User Management</h1>
      <p className="page-desc">Manage your application users, subscriptions, and account status.</p>

      <div className="table-container">
        <div className="table-header">
          <div>USER</div>
          <div>EMAIL</div>
          <div>PLAN STATUS</div>
          <div>ACTIONS</div>
        </div>

        {users.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No users found.</div>
        ) : (
          users.map((user) => (
            <div key={user.uid} className="table-row">
              <div className="user-info">
                <div className="user-avatar">{user.name?.charAt(0) || user.displayName?.charAt(0) || "U"}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{user.name || user.displayName || "Anonymous"}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>@{user.username}</div>
                </div>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{user.email}</div>
              <div>
                <span className={`badge ${user.plan === "unlimited" || user.plan === "premium" ? "badge-active" : "badge-inactive"}`}>
                  {user.plan || "free"}
                </span>
              </div>
              <div>
                <select 
                  className="btn-outline" 
                  style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "6px", cursor: "pointer" }}
                  value={user.plan || "free"}
                  disabled={updatingUid === user.uid}
                  onChange={(e) => handleUpdatePlan(user.uid, e.target.value)}
                >
                  <option value="free">Free Plan</option>
                  <option value="unlimited">Unlimited</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
