import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import toast from 'react-hot-toast';
import ViolationSidebar from '../../components/common/ViolationSidebar';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [skills, setSkills] = useState([]);
  const [affiliations, setAffiliations] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState('Beginner');
  const [editingIdx, setEditingIdx] = useState(null);
  const [expandedSet, setExpandedSet] = useState(new Set());
  const [showViolationSidebar, setShowViolationSidebar] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await api.get('/students/profile/me');
        setProfile(resp.data.data);
        setSkills(resp.data.data?.skills || []);
        // fetch affiliations stored in the Affiliation model
        try {
          const sid = resp.data.data?._id;
          // also include any affiliations stored directly on the Student document
          const studentAffs = resp.data.data?.affiliations || [];
          const mappedStudentAffs = (studentAffs || []).map((sa, i) => ({
            _id: `studentAff-${i}`,
            organizationId: { name: sa.name },
            role: sa.role || 'Member',
            startDate: sa.dateJoined || sa.startDate,
            status: 'active'
          }));
          let affRes = { data: { data: [] } };
          if (sid) {
            affRes = await api.get(`/affiliations/student/${sid}`);
          }
          // fallback: some server flows may have saved affiliations using the User._id
          if ((!affRes.data.data || affRes.data.data.length === 0) && user && user._id) {
            try {
              const byUser = await api.get(`/affiliations/student/${user._id}`);
              affRes = byUser;
            } catch (e) {
              // ignore
            }
          }
          setAffiliations([...(affRes.data.data || []), ...mappedStudentAffs]);
        } catch (err) {
          setAffiliations([]);
        }
      } catch (e) {
        // ignore
      }
      try {
        const [orgRes, grpRes] = await Promise.all([
          api.get('/organizations'),
          api.get('/organizations/groups')
        ]);
        setOrganizations(orgRes.data.data || []);
        setGroups(grpRes.data.data || []);
      } catch (e) {
        setOrganizations([]);
        setGroups([]);
      }
    };
    fetch();
  }, []);
  const saveAffiliations = async () => {
    if (!profile) return toast.error('Profile not loaded');

    try {
      // Create affiliation(s) immediately. Do not use pending/approval flow.
      if (selectedOrg) {
        await api.post(`/affiliations/${profile._id}`, { organizationId: selectedOrg });
      }
      if (selectedGroup) {
        await api.post(`/affiliations/${profile._id}`, { groupId: selectedGroup });
      }

      // Refresh profile and affiliations
      const resp = await api.get('/students/profile/me');
      setProfile(resp.data.data);
      try {
        const sid = resp.data.data?._id;
        let affRes = { data: { data: [] } };
        if (sid) {
          affRes = await api.get(`/affiliations/student/${sid}`);
        }
        if ((!affRes.data.data || affRes.data.data.length === 0) && user && user._id) {
          try {
            const byUser = await api.get(`/affiliations/student/${user._id}`);
            affRes = byUser;
          } catch (e) {
            // ignore
          }
        }
        const studentAffs = resp.data.data?.affiliations || [];
        const mappedStudentAffs = (studentAffs || []).map((sa, i) => ({
          _id: `studentAff-${i}`,
          organizationId: { name: sa.name },
          role: sa.role || 'Member',
          startDate: sa.dateJoined || sa.startDate,
          status: 'active'
        }));
        setAffiliations([...(affRes.data.data || []), ...mappedStudentAffs]);
      } catch (err) {
        setAffiliations([]);
      }
      toast.success('Affiliation(s) saved');
      setSelectedOrg('');
      setSelectedGroup('');
    } catch (err) {
      console.error('Save affiliations error', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save affiliation(s)';
      toast.error(String(msg));
    }
  };
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return toast.error('Skill name required');
    const updated = [...skills, { skillName: newSkillName.trim(), proficiencyLevel: newSkillProf }];
    setSkills(updated);
    setNewSkillName('');
    setNewSkillProf('Beginner');
    persistSkillsToServer(updated);
  };

  const handleRemoveSkill = (idx) => {
    const updated = skills.filter((_, i) => i !== idx);
    setSkills(updated);
    persistSkillsToServer(updated);
  };

  const handleSkillChange = (idx, field, value) => {
    setSkills(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const onDragStart = (e, idx) => {
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const onDrop = (e, idx) => {
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(from)) return;
    setSkills(prev => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(idx, 0, item);
      return copy;
    });
  };

  const onDragOver = (e) => { e.preventDefault(); };

  const persistSkillsToServer = async (skillsToSave) => {
    if (!Array.isArray(skillsToSave)) return;
    if (skillsToSave.length === 0) {
      // allow empty skills (clearing all)
      try {
        await api.put('/students/profile/me', { skills: [] });
        setProfile((p) => ({ ...p, skills: [] }));
        setSkills([]);
        return true;
      } catch (err) {
        console.error('Persist empty skills error', err);
        toast.error('Failed to update skills');
        return false;
      }
    }

    for (let i = 0; i < skillsToSave.length; i++) {
      if (!skillsToSave[i].skillName || String(skillsToSave[i].skillName).trim() === '') {
        toast.error(`Skill #${i + 1} is missing a name`);
        return false;
      }
      if (!['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(skillsToSave[i].proficiencyLevel)) {
        toast.error(`Skill #${i + 1} has invalid proficiency`);
        return false;
      }
    }

    try {
      await api.put('/students/profile/me', { skills: skillsToSave });
      const resp = await api.get('/students/profile/me');
      setProfile(resp.data.data);
      setSkills(resp.data.data?.skills || []);
      toast.success('Skills updated');
      return true;
    } catch (err) {
      console.error('Persist skills error:', err.response || err.message || err);
      const serverMsg = err.response?.data?.message || err.response?.data?.errors || err.response?.data || err.message;
      if (typeof serverMsg === 'object') {
        const parts = [];
        for (const k in serverMsg) parts.push(`${k}: ${serverMsg[k]}`);
        toast.error(parts.join('; '));
      } else {
        toast.error(String(serverMsg));
      }
      return false;
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)' }}>My Profile</h1>
      <div className="violation-fab">
        <ClayButton onClick={() => setShowViolationSidebar(true)}>Violations</ClayButton>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div className="grid grid-2">
          <ClayCard>
            <h3 style={{ color: 'var(--primary-orange)' }}>Personal</h3>
            <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
            <p><strong>Student Number:</strong> {profile.studentNumber}</p>
            <p><strong>Email:</strong> {profile.email}</p>
          </ClayCard>

          <ClayCard>
            <h3 style={{ color: 'var(--primary-orange)' }}>Affiliations</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Select an affiliation and click Save. No approval required.</p>

            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Organization</label>
              <select value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)} className="clay-select">
                <option value="">-- Select organization (optional) --</option>
                {organizations.map(o => (
                  <option key={o._id} value={o._id}>{o.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Group</label>
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="clay-select">
                <option value="">-- Select group (optional) --</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '16px' }}>
              <ClayButton onClick={saveAffiliations}>Save Affiliations</ClayButton>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ margin: '8px 0 6px' }}>Current Affiliations</h4>
              {affiliations.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>You have no affiliations yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {affiliations.map((a) => (
                    <div key={a._id} style={{ padding: '10px', background: 'var(--clay-surface-alt)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          {a.organizationId ? (
                            <div><strong>{a.organizationId.name}</strong> <span style={{ color: 'var(--text-secondary)' }}>({a.role || 'member'})</span></div>
                          ) : a.groupId ? (
                            <div><strong>{a.groupId.name}</strong> <span style={{ color: 'var(--text-secondary)' }}>({a.role || 'member'})</span></div>
                          ) : (
                            <div><strong>Affiliation</strong></div>
                          )}
                          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{a.startDate ? new Date(a.startDate).toLocaleDateString() : ''}</div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {a.status === 'pending' ? 'Pending' : 'Active'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            {/* debug removed */}
            </div>
          </ClayCard>
        </div>
        <ViolationSidebar open={showViolationSidebar} onClose={() => setShowViolationSidebar(false)} violations={profile.violations || []} />
        
        {/* Skills editor */}
        <div style={{ marginTop: '20px' }}>
          <ClayCard>
            <h3 style={{ color: 'var(--primary-orange)' }}>Skills & Proficiency</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Add your skills and set proficiency. Drag to reorder.</p>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
              <input className="clay-input" placeholder="Skill name" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} style={{ width: '240px' }} />
              <select className="clay-select" value={newSkillProf} onChange={(e) => setNewSkillProf(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Expert</option>
              </select>
              <ClayButton onClick={handleAddSkill}>Add Skill</ClayButton>
              {/* global save removed: per-skill Update/Delete will persist changes */}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {skills.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No skills added yet</div>}
              {skills.map((s, idx) => {
                const isExpanded = expandedSet.has(idx);
                return (
                  <div key={idx}
                    draggable
                    onDragStart={(e) => onDragStart(e, idx)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, idx)}
                    style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px', background: 'var(--clay-surface-alt)', borderRadius: '8px' }}
                  >
                    <div
                      style={{ width: '24px', textAlign: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = new Set(expandedSet);
                        if (next.has(idx)) next.delete(idx); else next.add(idx);
                        setExpandedSet(next);
                      }}
                    >{isExpanded ? '▾' : '☰'}</div>

                    {isExpanded ? (
                      // expanded: show editable inputs and buttons
                      <>
                        <input className="clay-input" value={s.skillName} onChange={(e) => handleSkillChange(idx, 'skillName', e.target.value)} style={{ flex: 1 }} readOnly={editingIdx !== idx} />
                        <select className="clay-select" value={s.proficiencyLevel} onChange={(e) => handleSkillChange(idx, 'proficiencyLevel', e.target.value)} style={{ width: '160px' }} disabled={editingIdx !== idx}>
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Expert</option>
                        </select>
                        {editingIdx === idx ? (
                          <ClayButton onClick={async () => {
                            const ok = await persistSkillsToServer(skills);
                            if (ok) setEditingIdx(null);
                          }}>Update</ClayButton>
                        ) : (
                          <ClayButton onClick={() => setEditingIdx(idx)}>Edit</ClayButton>
                        )}
                        <ClayButton variant="danger" onClick={async () => {
                          const updated = skills.filter((_, i) => i !== idx);
                          setSkills(updated);
                          setEditingIdx(null);
                          setExpandedSet(prev => { const n = new Set(prev); n.delete(idx); return n; });
                          await persistSkillsToServer(updated);
                        }}>Delete</ClayButton>
                      </>
                    ) : (
                      // collapsed: show text only
                      <>
                        <div style={{ flex: 1 }}>{s.skillName}</div>
                        <div style={{ width: '160px', textAlign: 'right', color: 'var(--text-secondary)' }}>{s.proficiencyLevel}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
export default StudentProfile;
