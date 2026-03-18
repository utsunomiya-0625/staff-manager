"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { Skill, UserSkill } from "@/lib/types";
import { Award, Plus, Star, Trash2, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("technical");

  const profile = store.getProfile();

  useEffect(() => {
    setSkills(store.getSkills());
    setUserSkills(store.getUserSkills());
  }, []);

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const existing = skills.find((s) => s.name.toLowerCase() === newSkill.trim().toLowerCase());
    const skill = existing || { id: uuidv4(), name: newSkill.trim(), category: newCategory, created_at: new Date().toISOString() };
    if (!existing) { store.saveSkill(skill); setSkills(store.getSkills()); }
    if (!userSkills.some((us) => us.skill_id === skill.id)) {
      const us: UserSkill = { id: uuidv4(), user_id: profile.id, skill_id: skill.id, level: 1 };
      store.saveUserSkill(us);
      setUserSkills(store.getUserSkills());
    }
    setNewSkill(""); setShowAdd(false);
  };

  const updateLevel = (usId: string, level: number) => {
    const us = userSkills.find((x) => x.id === usId);
    if (us) { store.saveUserSkill({ ...us, level }); setUserSkills(store.getUserSkills()); }
  };

  const removeSkill = (usId: string) => {
    store.deleteUserSkill(usId);
    setUserSkills(store.getUserSkills());
  };

  const mySkills = userSkills.filter((us) => us.user_id === profile.id);
  const grouped = mySkills.reduce<Record<string, { skill: Skill; us: UserSkill }[]>>((acc, us) => {
    const skill = skills.find((s) => s.id === us.skill_id);
    if (!skill) return acc;
    const cat = skill.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ skill, us });
    return acc;
  }, {});

  const catLabels: Record<string, string> = { technical: "技術", language: "言語", tool: "ツール", soft: "ソフトスキル", other: "その他" };

  return (
    <>
      <Header title="スキル管理" subtitle="技術スキルの可視化・管理" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{mySkills.length} スキル登録済み</p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
            <Plus size={18} /> スキル追加
          </button>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <Award size={48} className="text-muted mb-4" />
            <p className="text-muted text-sm">スキルを追加してください</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="mb-3 text-sm font-bold text-muted">{catLabels[cat] || cat}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(({ skill, us }) => (
                  <div key={us.id} className="group flex items-center justify-between rounded-xl border border-card-border bg-card-bg p-4">
                    <div>
                      <p className="text-sm font-medium">{skill.name}</p>
                      <div className="mt-1 flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((lv) => (
                          <button key={lv} onClick={() => updateLevel(us.id, lv)}>
                            <Star size={16} className={lv <= us.level ? "fill-warning text-warning" : "text-muted"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeSkill(us.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-card-bg shadow-2xl">
              <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
                <h2 className="text-lg font-bold">スキル追加</h2>
                <button onClick={() => setShowAdd(false)} className="rounded-lg p-2 hover:bg-background"><X size={20} /></button>
              </div>
              <form onSubmit={addSkill} className="p-6 space-y-4">
                <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="スキル名（例: React, Python）" required className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm">
                  {Object.entries(catLabels).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
                </select>
                <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover">追加</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
