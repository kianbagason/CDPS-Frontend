import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import api from '../../services/api';

const StudentAffiliations = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [myOrganizations, setMyOrganizations] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [manageModal, setManageModal] = useState({ open: false, type: null, item: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch all orgs/groups for available affiliations list
        const [orgRes, groupRes, profileRes] = await Promise.all([
          api.get('/organizations'),
          api.get('/organizations/groups'),
          api.get('/students/profile/me')
        ]);

        setOrganizations(orgRes.data.data || []);
        setGroups(groupRes.data.data || []);

        // fetch affiliations for this student (includes OIC entries)
        const student = profileRes.data.data;
        setStudentProfile(student);
        const studentId = student?._id;
        if (studentId) {
          const affRes = await api.get(`/affiliations/student/${studentId}`);
          const affs = affRes.data.data || [];
          const orgs = affs.filter(a => a.organizationId).map(a => a.organizationId);
          const grps = affs.filter(a => a.groupId).map(a => a.groupId);
          setMyOrganizations(orgs);
          setMyGroups(grps);
        }
      } catch (err) {
        console.error('Failed to fetch affiliations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [orgRes, groupRes, profileRes] = await Promise.all([
        api.get('/organizations'),
        api.get('/organizations/groups'),
        api.get('/students/profile/me')
      ]);
      setOrganizations(orgRes.data.data || []);
      setGroups(groupRes.data.data || []);

      const student = profileRes.data.data;
      setStudentProfile(student);
      const studentId = student?._id;
      if (studentId) {
        const affRes = await api.get(`/affiliations/student/${studentId}`);
        const affs = affRes.data.data || [];
        setMyOrganizations(affs.filter(a => a.organizationId).map(a => a.organizationId));
        setMyGroups(affs.filter(a => a.groupId).map(a => a.groupId));
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setLoading(false);
    }
  };

  const studentId = studentProfile?._id;
  const isMemberOf = (list, id) => list.some((item) => (item.members || []).some((m) => m.studentId?._id === studentId && m.status === 'active'));
  const isPendingOf = (list, id) => list.some((item) => (item.members || []).some((m) => m.studentId?._id === studentId && m.status === 'pending'));

  const requestJoin = async (type, targetId) => {
    try {
      const endpoint = type === 'organization' 
        ? `/organizations/${targetId}/join`
        : `/organizations/groups/${targetId}/join`;
      
      await api.post(endpoint);
      await refreshData();
    } catch (err) {
      console.error('Failed to join:', err);
    }
  };

  // OIC removed: no OIC checks

  const approveMember = async (type, targetId, memberId) => {
    try {
      const endpoint = type === 'organization'
        ? `/organizations/${targetId}/members/${memberId}/approve`
        : `/organizations/groups/${targetId}/members/${memberId}/approve`;
      
      await api.put(endpoint);
      await refreshData();
    } catch (err) {
      console.error('Failed to approve member:', err);
    }
  };

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)' }}>My Affiliations</h1>

      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Organizations</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={refreshData} className="clay-button clay-button-secondary">Refresh</button>
            <ClayButton onClick={() => setJoinModalOpen(true)}>Join Affiliation</ClayButton>
          </div>
        </div>
        <div style={{ marginTop: '8px' }}>
          {(myOrganizations || []).length === 0 ? (
            <ClayCard>
              <p style={{ padding: '16px', color: 'var(--text-secondary)' }}>You have no organization affiliations yet.</p>
            </ClayCard>
          ) : (
            <div className="grid grid-2">
              {myOrganizations.map((o) => (
                <ClayCard key={o._id}>
                  <h4 style={{ margin: 0 }}>{o.name}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{(o.members||[]).find(m => m.studentId?._id === studentId)?.status === 'pending' ? 'Pending verification' : 'Member'}</p>
                </ClayCard>
              ))}
            </div>
          )}
        </div>

        <h3 style={{ marginTop: '20px' }}>Groups</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginTop: '20px' }}>Groups</h3>
            <button onClick={refreshData} className="clay-button clay-button-secondary">Refresh</button>
          </div>
        <div style={{ marginTop: '8px' }}>
          {(myGroups || []).length === 0 ? (
            <ClayCard>
              <p style={{ padding: '16px', color: 'var(--text-secondary)' }}>You have no group affiliations yet.</p>
            </ClayCard>
          ) : (
            <div className="grid grid-2">
              {myGroups.map((g) => (
                <ClayCard key={g._id}>
                  <h4 style={{ margin: 0 }}>{g.name}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{(g.members||[]).find(m => m.studentId?._id === studentId)?.status === 'pending' ? 'Pending verification' : 'Member'}</p>
                </ClayCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '28px' }}>
        {/* Removed inline Available Affiliations section — Join is now via modal */}
      </div>

      {/* Join Affiliation Modal */}
      {joinModalOpen && (
        <div className="clay-modal-overlay" onClick={() => setJoinModalOpen(false)}>
          <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <h2 style={{ color: 'var(--primary-orange)' }}>Join Affiliation</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Choose an organization or group to request to join.</p>

            <div style={{ marginTop: '12px' }}>
              <h4>Organizations</h4>
              <div className="grid grid-2">
                {organizations.map((o) => (
                  <ClayCard key={o._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{o.name}</h4>
                        <p style={{ color: 'var(--text-secondary)' }}>{o.description || 'No description'}</p>
                      </div>
                      <div>
                        {isMemberOf(organizations, o._id) ? (
                          <span style={{ color: 'var(--text-secondary)' }}>Member</span>
                        ) : isPendingOf(organizations, o._id) ? (
                          <span style={{ color: 'var(--text-secondary)' }}>Pending</span>
                        ) : (
                          <ClayButton onClick={async () => { await requestJoin('organization', o._id); setJoinModalOpen(false); }}>Request to Join</ClayButton>
                        )}
                      </div>
                    </div>
                  </ClayCard>
                ))}
              </div>

              <h4 style={{ marginTop: '16px' }}>Groups</h4>
              <div className="grid grid-2">
                {groups.map((g) => (
                  <ClayCard key={g._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{g.name}</h4>
                        <p style={{ color: 'var(--text-secondary)' }}>{g.description || 'No description'}</p>
                      </div>
                      <div>
                        {isMemberOf(groups, g._id) ? (
                          <span style={{ color: 'var(--text-secondary)' }}>Member</span>
                        ) : isPendingOf(groups, g._id) ? (
                          <span style={{ color: 'var(--text-secondary)' }}>Pending</span>
                        ) : (
                          <ClayButton onClick={async () => { await requestJoin('group', g._id); setJoinModalOpen(false); }}>Request to Join</ClayButton>
                        )}
                      </div>
                    </div>
                  </ClayCard>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <ClayButton variant="secondary" onClick={() => setJoinModalOpen(false)}>Close</ClayButton>
            </div>
          </div>
        </div>
      )}

      {/* Manage modal for OICs */}
      {manageModal.open && (
        <div className="clay-modal-overlay" onClick={() => setManageModal({ open: false, type: null, item: null })}>
          <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: 'var(--primary-orange)' }}>{manageModal.type === 'organization' ? 'Manage Organization' : 'Manage Group'}</h2>
              <button className="clay-button clay-button-secondary" onClick={() => setManageModal({ open: false, type: null, item: null })}>Close</button>
            </div>

            <div style={{ marginTop: '12px' }}>
              <h4 style={{ marginBottom: '8px' }}>Pending Members</h4>
              {(!manageModal.item || (manageModal.item.members||[]).filter(m => m.status === 'pending').length === 0) ? (
                <p style={{ color: 'var(--text-secondary)' }}>No pending members</p>
              ) : (
                (manageModal.item.members||[]).filter(m => m.status === 'pending').map(m => (
                  <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.studentId?.firstName} {m.studentId?.lastName}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{m.studentId?.studentNumber}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <ClayButton onClick={async () => { await approveMember(manageModal.type, manageModal.item._id, m._id); setManageModal({ open: false, type: null, item: null }); }}>Approve</ClayButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAffiliations;
