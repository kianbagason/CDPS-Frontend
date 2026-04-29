import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import ClayInput from '../../components/UI/ClayInput';
import ClayButton from '../../components/UI/ClayButton';
import toast from 'react-hot-toast';

const EnrollmentForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [sectionLocked, setSectionLocked] = useState(false);
  const [checkingSection, setCheckingSection] = useState(false);
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [askSectionInput, setAskSectionInput] = useState('');
  const [askInfo, setAskInfo] = useState(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionModalInfo, setSectionModalInfo] = useState(null);
  const [sectionChecking, setSectionChecking] = useState(false);
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false);
  const [pickerSections, setPickerSections] = useState([]);
  const [selectedPickerSection, setSelectedPickerSection] = useState(null);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [firstYearChecked, setFirstYearChecked] = useState(false);
  const [sectionTyping, setSectionTyping] = useState(false);
  const typingTimer = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    studentNumber: '', // Auto-generated
    course: 'BSIT',
    yearLevel: 1,
    section: '',
    enrollmentYear: new Date().getFullYear()
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'section') {
      setFormData({ ...formData, section: String(value || '').toUpperCase() });
      setSectionTyping(true);
      // reset previously-run check when user edits section
      setFirstYearChecked(false);
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === 'email') setFirstYearChecked(false);
    }
  };

  useEffect(() => {
    const y = parseInt(formData.yearLevel, 10) || 1;
    // Clear existing timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    // Only trigger when user is typing, not when section was auto-filled, and conditions met
    if (
      sectionTyping &&
      !firstYearChecked &&
      !sectionLocked &&
      y > 1 &&
      formData.email &&
      String(formData.section || '').trim() !== ''
    ) {
      // debounce for 1s after user stops typing
      typingTimer.current = setTimeout(() => {
        checkFirstYearSection(formData.email, formData.yearLevel);
        setFirstYearChecked(true);
        setSectionTyping(false);
      }, 1000);
    }

    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
        typingTimer.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.section, formData.email, formData.yearLevel, sectionTyping, sectionLocked, firstYearChecked]);

  const openSectionPicker = async () => {
    // Prepare default section choices (adjust as needed)
    const choices = ['A', 'B', 'C', 'D', 'E', 'F'];
    const course = formData.course;
    const year = parseInt(formData.yearLevel, 10) || 1;
    setPickerLoading(true);
    setSectionPickerOpen(true);
    setSelectedPickerSection(null);

    try {
      const calls = choices.map((sec) => api.get('/enrollment/section-count', { params: { course, yearLevel: year, section: sec } }).then(r => ({ section: sec, ...r.data })).catch(() => ({ section: sec, success: false, count: 0, remaining: 0, max: 55 })));
      const results = await Promise.all(calls);
      // Normalize results to expected shape
      const normalized = results.map((r) => ({ section: r.section, count: r.count || 0, remaining: (typeof r.remaining === 'number') ? r.remaining : Math.max(0, (r.max || 55) - (r.count || 0)), max: r.max || 55 }));
      setPickerSections(normalized);
    } catch (err) {
      console.error('Error opening section picker', err);
      toast.error('Unable to load section availability. Try again later.');
      setPickerSections(choices.map(s => ({ section: s, count: 0, remaining: 0, max: 55 })));
    } finally {
      setPickerLoading(false);
    }
  };

  const handleSectionBlur = async () => {
    // Only run when yearLevel is defined and section is not empty
    const course = formData.course;
    const year = parseInt(formData.yearLevel, 10) || 1;
    const section = (formData.section || '').trim();
    if (!section) return;

    try {
      setSectionChecking(true);
      const resp = await api.get('/enrollment/section-count', { params: { course, yearLevel: year, section } });
      if (resp.data && resp.data.success) {
        setSectionModalInfo({ section, count: resp.data.count, remaining: resp.data.remaining, max: resp.data.max });
        setSectionModalOpen(true);
      } else {
        toast.error('Failed to fetch section availability.');
      }
    } catch (error) {
      console.error('Error fetching section count', error);
      toast.error('Unable to check section availability. Try again later.');
    } finally {
      setSectionChecking(false);
    }
  };

  const handleNext = () => {
    // Validate required fields for step 1 before moving to step 2
    const required = ['firstName', 'lastName', 'email', 'dateOfBirth', 'gender', 'address'];
    for (const key of required) {
      if (!formData[key] || String(formData[key]).trim() === '') {
        toast.error('Please fill out all required personal information fields');
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(formData.email).trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate age >= 15 (client-side convenience check; server will also enforce)
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 15) {
        toast.error('Please Enter a valid date of birth');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/enrollment/register', formData);
      setCredentials(response.data.data);
      toast.success('Enrollment successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  // When user moves to step 2 or when email/yearLevel changes,
  // if yearLevel > 1 try to find a 1st-year record by email to reuse section.
  const checkFirstYearSection = async (emailParam, yearLevelParam) => {
    const emailToCheck = (emailParam || formData.email || '').trim();
    if (!emailToCheck) return;

    const y = parseInt(yearLevelParam || formData.yearLevel, 10) || 1;
    setCheckingSection(true);

    try {
      if (y > 1) {
        // Use public endpoint to avoid triggering auth redirects
        const resp = await api.get('/enrollment/find-first-year', { params: { email: emailToCheck } });
        if (resp.data?.found) {
          setFormData((prev) => ({ ...prev, section: String(resp.data.section || '').toUpperCase() }));
          setSectionLocked(true);
        } else {
          // No 1st-year record found — prompt user to enter it
          setAskSectionInput('');
          setAskInfo(null);
          setAskModalOpen(true);
        }
      } else {
        // 1st year selected — ensure section input remains editable
        setSectionLocked(false);
      }
    } catch (error) {
      console.error('Error checking first-year section', error);
      toast.error('Unable to check 1st-year record (network or server issue). You may enter section manually.');
      // In case of error, keep section editable so user can continue
      setSectionLocked(false);
    } finally {
      setCheckingSection(false);
    }
  };

  if (credentials) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div className="clay-card" style={{ maxWidth: '500px', width: '100%' }}>
          <h2 style={{ color: 'var(--success)', marginBottom: '16px', textAlign: 'center' }}>
            ✓ Enrollment Successful!
          </h2>
          
          <div style={{
            background: 'rgba(252, 94, 3, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary-orange)' }}>
              ⚠️ IMPORTANT: Save these credentials now!
            </p>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>
              You will not be able to see your password again.
            </p>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Username:</label>
              <div style={{
                background: '#fff',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '4px',
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#111',
                fontWeight: 800,
                border: '1px solid rgba(0,0,0,0.12)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                {credentials.username}
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(credentials.username);
                      toast.success('Username copied');
                    } catch (err) {
                      toast.error('Unable to copy');
                    }
                  }}
                  style={{ background: 'var(--primary-orange)', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >Copy</button>
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Password:</label>
              <div style={{
                background: '#fff',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '4px',
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#111',
                fontWeight: 800,
                border: '1px solid rgba(0,0,0,0.12)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                {credentials.password}
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(credentials.password);
                      toast.success('Password copied');
                    } catch (err) {
                      toast.error('Unable to copy');
                    }
                  }}
                  style={{ background: 'var(--primary-orange)', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >Copy</button>
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Student Number:</label>
              <div style={{
                background: '#fff',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '4px',
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#111',
                fontWeight: 800,
                border: '1px solid rgba(0,0,0,0.12)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                {credentials.studentNumber}
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(credentials.studentNumber);
                      toast.success('Student number copied');
                    } catch (err) {
                      toast.error('Unable to copy');
                    }
                  }}
                  style={{ background: 'var(--primary-orange)', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >Copy</button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px', padding: '8px 12px', background: '#fff7e6', borderRadius: '8px', border: '1px solid rgba(252,94,3,0.15)' }}>
            <strong style={{ color: 'var(--primary-orange)' }}>Please Update Your Credentials Upon logging.</strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>We have also added this reminder to your notifications — you can dismiss it from your student portal.</div>
          </div>

          <ClayButton
            onClick={() => navigate('/login')}
            style={{ width: '100%' }}
          >
            Go to Login
          </ClayButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="clay-card" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ color: 'var(--primary-orange)', marginBottom: '8px', textAlign: 'center' }}>
          Student Enrollment
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
          Step {step} of 2
        </p>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Personal Information</h3>
              
              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <ClayInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <ClayInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <ClayInput
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                />
                <ClayInput
                  label="Suffix"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                  placeholder="Jr., Sr., III, etc."
                />
              </div>

              <ClayInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mb-md"
              />

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <ClayInput
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <ClayInput
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="clay-select"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <ClayInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="mb-lg"
              />

              <ClayButton onClick={handleNext} style={{ width: '100%' }} type="button">
                Next Step
              </ClayButton>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Academic Information</h3>
              
              <div style={{
                padding: '16px',
                background: 'rgba(252, 94, 3, 0.1)',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  ℹ️ <strong>Note:</strong> Your student number will be automatically generated upon enrollment.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Course *
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className="clay-select"
                >
                  <option value="BSIT">BSIT - Bachelor of Science in Information Technology</option>
                  <option value="BSCS">BSCS - Bachelor of Science in Computer Science</option>
                </select>
              </div>

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Year Level *
                  </label>
                  <select
                    name="yearLevel"
                    value={formData.yearLevel}
                    onChange={(e) => {
                        handleChange(e);
                        // Do NOT auto-check 1st-year on year change — wait until user interacts with section
                        setFirstYearChecked(false);
                      }}
                    required
                    className="clay-select"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Section *
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    placeholder="e.g., A, B, C"
                    className="clay-input"
                    disabled={sectionLocked}
                    onFocus={() => {
                      const y = parseInt(formData.yearLevel, 10) || 1;
                      // Only check once per email/year when user focuses the section input
                      if (y > 1 && !sectionLocked && !formData.section && !firstYearChecked && formData.email) {
                        checkFirstYearSection(formData.email, formData.yearLevel);
                        setFirstYearChecked(true);
                      }
                    }}
                    onBlur={() => {
                      // When user finishes entering a section, show availability modal (only for year > 0)
                      const y = parseInt(formData.yearLevel, 10) || 1;
                      if (!sectionLocked && formData.section && String(formData.section).trim() !== '') {
                        handleSectionBlur();
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                  {!sectionLocked && (
                    <div>
                      <ClayButton
                        variant="secondary"
                        onClick={async () => {
                          // Open picker to show multiple sections and let user pick
                          await openSectionPicker();
                        }}
                        style={{ whiteSpace: 'nowrap' }}
                        type="button"
                      >
                        Check Slots
                      </ClayButton>
                    </div>
                  )}
                  </div>
                  {checkingSection && <div style={{ marginTop: '6px', color: 'var(--text-light)' }}>Checking 1st-year record...</div>}
                  {sectionLocked && !checkingSection && (
                    <div style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                      Section auto-filled from 1st-year record and locked.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <ClayButton onClick={handleBack} variant="secondary" style={{ flex: 1 }} type="button">
                  Back
                </ClayButton>
                <ClayButton
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Submitting...' : 'Submit Enrollment'}
                </ClayButton>
              </div>
            </div>
          )}
        </form>

        {/* Ask 1st-year section modal */}
        {askModalOpen && (
          <div className="clay-modal-overlay" onClick={() => setAskModalOpen(false)}>
            <div className="clay-modal" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ color: 'var(--primary-orange)' }}>No 1st-year record found</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                We couldn't find a 1st-year record for the provided email. Please enter the section you were in during 1st year.
              </p>

              <div style={{ marginTop: '12px' }}>
                <label style={{ fontWeight: '600' }}>1st Year Section</label>
                <input
                  value={askSectionInput}
                  onChange={(e) => setAskSectionInput(String(e.target.value || '').toUpperCase())}
                  placeholder="e.g., A, B, C"
                  className="clay-input"
                  style={{ marginTop: '8px' }}
                />
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <ClayButton
                  variant="secondary"
                  onClick={() => setAskModalOpen(false)}
                >
                  Cancel
                </ClayButton>
                <ClayButton
                  onClick={async () => {
                    if (!askSectionInput || askSectionInput.trim() === '') {
                      toast.error('Please enter a section');
                      return;
                    }

                    // Fetch remaining slots for 1st year and for the selected target year
                    try {
                      const course = formData.course;
                      const targetYear = formData.yearLevel;
                      // Request counts
                      const resp1 = await api.get('/enrollment/section-count', { params: { course, yearLevel: 1, section: askSectionInput } });
                      const respTarget = await api.get('/enrollment/section-count', { params: { course, yearLevel: targetYear, section: askSectionInput } });
                      const info = {
                        section: askSectionInput,
                        year1: resp1.data,
                        target: respTarget.data
                      };
                      setAskInfo(info);

                      // If target remaining is 0, show error and let user choose another section
                      if (info.target.remaining <= 0) {
                        toast.error(`Section ${askSectionInput} is full for year ${targetYear}. Please choose a different section.`);
                        return;
                      }

                      // Accept and fill section
                      setFormData((prev) => ({ ...prev, section: askSectionInput }));
                      setSectionLocked(true);
                      setAskModalOpen(false);
                      toast.success(`Section ${askSectionInput} selected (remaining slots: ${info.target.remaining})`);
                    } catch (error) {
                      console.error('Error fetching section counts', error);
                      toast.error('Failed to check section availability');
                    }
                  }}
                >
                  Confirm Section
                </ClayButton>
              </div>

              {askInfo && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>1st Year — Count: {askInfo.year1.count}, Remaining: {askInfo.year1.remaining}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Year {formData.yearLevel} — Count: {askInfo.target.count}, Remaining: {askInfo.target.remaining}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section availability modal (when user picks a section) */}
        {sectionModalOpen && (
          <div className="clay-modal-overlay" onClick={() => setSectionModalOpen(false)}>
            <div className="clay-modal" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ color: 'var(--primary-orange)' }}>Section Availability</h2>
              {sectionChecking && <div style={{ color: 'var(--text-secondary)' }}>Checking section availability...</div>}
              {sectionModalInfo && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Section: <strong>{sectionModalInfo.section}</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>Count: {sectionModalInfo.count}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Remaining: {sectionModalInfo.remaining} / {sectionModalInfo.max}</div>
                </div>
              )}

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <ClayButton variant="secondary" onClick={() => setSectionModalOpen(false)}>Cancel</ClayButton>
                <ClayButton onClick={() => {
                  if (!sectionModalInfo) return;
                  if (sectionModalInfo.remaining <= 0) {
                    toast.error(`Section ${sectionModalInfo.section} is full. Please choose another section.`);
                    return;
                  }
                  setSectionLocked(true);
                  setSectionModalOpen(false);
                  toast.success(`Section ${sectionModalInfo.section} selected (remaining: ${sectionModalInfo.remaining})`);
                }}>Confirm Section</ClayButton>
              </div>
            </div>
          </div>
        )}

        {/* Section picker modal: show multiple section options and availability */}
        {sectionPickerOpen && (
          <div className="clay-modal-overlay" onClick={() => setSectionPickerOpen(false)}>
            <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <h2 style={{ color: 'var(--primary-orange)' }}>Choose Section</h2>
              {pickerLoading && <div style={{ color: 'var(--text-secondary)' }}>Loading availability...</div>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
                {pickerSections.map((s) => (
                  <button
                    key={s.section}
                    type="button"
                    onClick={() => setSelectedPickerSection(s.section)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: selectedPickerSection === s.section ? '2px solid var(--primary-orange)' : '1px solid rgba(0,0,0,0.1)',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{s.section}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Remaining: {s.remaining}</div>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <ClayButton variant="secondary" onClick={() => setSectionPickerOpen(false)}>Cancel</ClayButton>
                <ClayButton onClick={() => {
                  if (!selectedPickerSection) {
                    toast.error('Select a section first');
                    return;
                  }
                  const picked = pickerSections.find(p => p.section === selectedPickerSection);
                  if (!picked) return;
                  if (picked.remaining <= 0) {
                    toast.error(`Section ${picked.section} is full. Choose another.`);
                    return;
                  }
                  // Apply selection
                  setFormData((prev) => ({ ...prev, section: picked.section }));
                  setSectionLocked(true);
                  setSectionPickerOpen(false);
                  toast.success(`Section ${picked.section} selected (remaining: ${picked.remaining})`);
                }}>Confirm Pick</ClayButton>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link 
            to="/login" 
            style={{ 
              color: 'var(--primary-orange)', 
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentForm;
