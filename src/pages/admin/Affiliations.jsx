import { useState, useEffect } from 'react';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import ClayInput from '../../components/UI/ClayInput';
import api from '../../services/api';

const Affiliations = () => {
  const [activeTab, setActiveTab] = useState('organization');

  const [organizations, setOrganizations] = useState([]);
  const [groups, setGroups] = useState([]);

  const [orgForm, setOrgForm] = useState({ name: '', description: '' });
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });

  // OIC removed: admin creates org/group with name and optional description only

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState({ open: false, type: null });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleOrgChange = (e) => setOrgForm({ ...orgForm, [e.target.name]: e.target.value });
  const handleGroupChange = (e) => setGroupForm({ ...groupForm, [e.target.name]: e.target.value });

  const openManageModal = (type) => {
    setShowManageModal({ open: true, type });
    setShowCreateForm(false);
  };

  const closeManageModal = () => {
    setShowManageModal({ open: false, type: null });
    setShowCreateForm(false);
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [orgRes, groupRes] = await Promise.all([
          api.get('/organizations'),
          api.get('/organizations/groups')
        ]);
        setOrganizations(orgRes.data.data || []);
        setGroups(groupRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch organizations/groups:', err);
      }
    };
    fetchInitial();
  }, []);

  // previously had OIC typeahead; removed to simplify admin creation


  const addOrganization = async (e) => {
    e.preventDefault();
    if (!orgForm.name) return;
    
    setLoading(true);
    try {
      await api.post('/organizations', {
        name: orgForm.name,
        description: orgForm.description,
        type: 'organization'
      });
      // refresh full list to ensure _id and populated fields are present
      const refreshed = await api.get('/organizations');
      setOrganizations(refreshed.data.data || []);
      setOrgForm({ name: '', description: '' });
      setShowOrgModal(false);
      setSuccessMessage('Organization created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to create organization:', err);
    } finally {
      setLoading(false);
    }
  };

  const addGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name) return;
    
    setLoading(true);
    try {
      await api.post('/organizations/groups', {
        name: groupForm.name,
        description: groupForm.description
      });
      // refresh full list to ensure _id and populated fields are present
      const refreshed = await api.get('/organizations/groups');
      setGroups(refreshed.data.data || []);
      setGroupForm({ name: '', description: '' });
      setShowGroupModal(false);
      setSuccessMessage('Group created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrganization = async (orgId) => {
    const org = organizations.find(o => o._id === orgId);
    if (!org) return;
    
    // For now, just show an alert. In a real implementation, this would open an update modal
    const newName = prompt('Update organization name:', org.name);
    if (newName && newName !== org.name) {
      try {
        await api.put(`/organizations/${orgId}`, { name: newName, description: org.description });
        const response = await api.get('/organizations');
        setOrganizations(response.data.data || []);
        setSuccessMessage('Organization updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Failed to update organization:', err);
      }
    }
  };

  const handleDeleteOrganization = async (orgId) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/organizations/${orgId}`);
      setOrganizations(organizations.filter(o => o._id !== orgId));
      setSuccessMessage('Organization deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete organization:', err);
    }
  };

  const handleUpdateGroup = async (groupId) => {
    const group = groups.find(g => g._id === groupId);
    if (!group) return;
    
    // For now, just show an alert. In a real implementation, this would open an update modal
    const newName = prompt('Update group name:', group.name);
    if (newName && newName !== group.name) {
      try {
        await api.put(`/organizations/groups/${groupId}`, { name: newName, description: group.description });
        const response = await api.get('/organizations/groups');
        setGroups(response.data.data || []);
        setSuccessMessage('Group updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Failed to update group:', err);
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/organizations/groups/${groupId}`);
      setGroups(groups.filter(g => g._id !== groupId));
      setSuccessMessage('Group deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--success-green, #28a745)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(40, 167, 69, 0.15)',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {successMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>School-Affiliated Organization and Groups</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage organizations and groups affiliated with school.
          </p>
        </div>
      </div>

      {/* Simple tab nav (no icons) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('organization')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeTab === 'organization' ? '2px solid var(--primary-orange)' : '1px solid rgba(255,255,255,0.06)',
            background: activeTab === 'organization' ? 'rgba(252, 94, 3, 0.06)' : 'transparent',
            color: activeTab === 'organization' ? 'var(--primary-orange)' : 'var(--text-secondary)'
          }}
        >
          Organization
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeTab === 'groups' ? '2px solid var(--primary-orange)' : '1px solid rgba(255,255,255,0.06)',
            background: activeTab === 'groups' ? 'rgba(252, 94, 3, 0.06)' : 'transparent',
            color: activeTab === 'groups' ? 'var(--primary-orange)' : 'var(--text-secondary)'
          }}
        >
          Groups
        </button>
      </div>

      {activeTab === 'organization' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Organizations</h2>
            <ClayButton onClick={() => openManageModal('organization')}>Manage Organization</ClayButton>
          </div>

          {organizations.length === 0 ? (
            <ClayCard>
              <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>No organizations yet.</p>
            </ClayCard>
          ) : (
            <div className="grid grid-2">
              {organizations.map((o) => (
                <ClayCard key={o._id}>
                  <h3 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>{o.name}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{o.description || 'No description'}</p>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}><strong>Code:</strong> {o.code || '—'}</p>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}><strong>Members:</strong> {o.members?.length || 0}</p>
                </ClayCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Groups</h2>
            <ClayButton onClick={() => openManageModal('group')}>Manage Group</ClayButton>
          </div>

          {groups.length === 0 ? (
            <ClayCard>
              <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>No groups yet.</p>
            </ClayCard>
          ) : (
            <div className="grid grid-2">
              {groups.map((g) => (
                <ClayCard key={g._id}>
                  <h3 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>{g.name}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{g.description || 'No description'}</p>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}><strong>Code:</strong> {g.code || '—'}</p>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}><strong>Members:</strong> {g.members?.length || 0}</p>
                </ClayCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manage Modal */}
      {showManageModal.open && (
        <div className="clay-modal-overlay" onClick={closeManageModal}>
          <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'var(--primary-orange)' }}>
                {showManageModal.type === 'organization' ? 'Manage Organizations' : 'Manage Groups'}
              </h2>
              <ClayButton onClick={closeManageModal} variant="secondary">✕</ClayButton>
            </div>

            {!showCreateForm ? (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <ClayButton onClick={() => setShowCreateForm(true)} style={{ width: '100%' }}>
                    + Create {showManageModal.type === 'organization' ? 'Organization' : 'Group'}
                  </ClayButton>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {(showManageModal.type === 'organization' ? organizations : groups).length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No {showManageModal.type === 'organization' ? 'organizations' : 'groups'} yet.
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {(showManageModal.type === 'organization' ? organizations : groups).map((item) => (
                        <div key={item._id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '16px', 
                          borderRadius: '8px', 
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', color: 'var(--primary-orange)' }}>{item.name}</h4>
                            <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                              {item.description || 'No description'}
                            </p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                              <strong>Members:</strong> {item.members?.length || 0}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <ClayButton 
                              onClick={() => {
                                if (showManageModal.type === 'organization') {
                                  handleUpdateOrganization(item._id);
                                } else {
                                  handleUpdateGroup(item._id);
                                }
                              }} 
                              variant="secondary" 
                              style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                              Update
                            </ClayButton>
                            <ClayButton 
                              onClick={() => {
                                if (showManageModal.type === 'organization') {
                                  handleDeleteOrganization(item._id);
                                } else {
                                  handleDeleteGroup(item._id);
                                }
                              }} 
                              variant="danger" 
                              style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                              Delete
                            </ClayButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Create Form */
              <div>
                <h3 style={{ color: 'var(--primary-orange)', marginBottom: '16px' }}>
                  Create New {showManageModal.type === 'organization' ? 'Organization' : 'Group'}
                </h3>
                <form onSubmit={showManageModal.type === 'organization' ? addOrganization : addGroup}>
                  <ClayInput 
                    label={showManageModal.type === 'organization' ? 'Organization Name' : 'Group Name'} 
                    name="name" 
                    value={showManageModal.type === 'organization' ? orgForm.name : groupForm.name} 
                    onChange={showManageModal.type === 'organization' ? handleOrgChange : handleGroupChange} 
                    required 
                    className="mb-md" 
                  />
                  <ClayInput 
                    label="Description" 
                    name="description" 
                    value={showManageModal.type === 'organization' ? orgForm.description : groupForm.description} 
                    onChange={showManageModal.type === 'organization' ? handleOrgChange : handleGroupChange} 
                    className="mb-md" 
                  />

                  {/* OIC removed: create with name and description only */}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <ClayButton type="submit" disabled={loading} style={{ flex: 1 }}>
                      {loading ? 'Creating...' : `Create ${showManageModal.type === 'organization' ? 'Organization' : 'Group'}`}
                    </ClayButton>
                    <ClayButton 
                      type="button" 
                      onClick={() => setShowCreateForm(false)} 
                      variant="secondary" 
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </ClayButton>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Affiliations;
