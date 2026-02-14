import { useState, useRef, useEffect } from 'react'
import './App.css'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area
} from 'recharts'
import {
  LayoutDashboard,
  ScanFace,
  Target,
  Map,
  Swords,
  BarChart2,
  Flame,
  Zap,
  Trophy,
  ChevronRight,
  TrendingUp,
  Award,
  Lock,
  Menu,
  Upload,
  Github,
  Sparkles,
  FileText,
  Users,
  ExternalLink
} from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [scanResult, setScanResult] = useState(null)
  const [gapResult, setGapResult] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:8000/metrics/user_1')
      const data = await resp.json()
      setMetrics(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  if (loading) return <div className="loading-state"><Sparkles className="spin" /></div>

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} metrics={metrics} />
      <main className="main-content">
        <DashboardHeader metrics={metrics} />

        {activeTab === 'dashboard' && <Dashboard metrics={metrics} />}
        {activeTab === 'profile-scan' && (
          <ProfileScan result={scanResult} setResult={setScanResult} />
        )}
        {activeTab === 'role-gap' && (
          <RoleGap
            userSkills={[
              ...(scanResult?.technical_skills || []),
              ...(scanResult?.github_analysis?.primary_languages || [])
            ]}
            gapResult={gapResult}
            setGapResult={setGapResult}
          />
        )}
        {activeTab === 'quest-map' && (
          <QuestMap gapResult={gapResult} />
        )}
        {activeTab === 'daily-quest' && (
          <DailyQuest onComplete={fetchMetrics} />
        )}
        {activeTab === 'stats' && (
          <PlayerStats metrics={metrics} fetchMetrics={fetchMetrics} />
        )}

        {/* Placeholders for other tabs */}
        {activeTab !== 'dashboard' && activeTab !== 'profile-scan' && activeTab !== 'role-gap' && activeTab !== 'quest-map' && activeTab !== 'daily-quest' && activeTab !== 'stats' && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Feature coming soon...
          </div>
        )}
      </main>
    </div>
  )
}

const Dashboard = ({ metrics }) => {
  return (
    <>
      <WelcomeSection metrics={metrics} />
      <StatsGrid metrics={metrics} />
      <ActionGrid />
      <CommunitiesSection metrics={metrics} />
    </>
  )
}

const ProfileScan = ({ result, setResult }) => {
  const [file, setFile] = useState(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file && !username) {
      alert("Please upload a resume or enter a GitHub username")
      return
    }

    setLoading(true)
    const formData = new FormData()
    if (file) formData.append('resume', file)
    if (username) formData.append('github_username', username)

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze-profile', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error analyzing profile:', error)
      alert("Failed to analyze profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Colors for the chart matching your theme
  const COLORS = ['#00F0FF', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899']

  return (
    <div className="scan-container">
      <div className="scan-header">
        <div className="scan-title">
          <ScanFace size={32} color="var(--accent-primary)" />
          <h2>Profile Analysis</h2>
        </div>
        <p className="scan-subtitle">Extract skills and insights from your resume and GitHub.</p>
      </div>

      {!result ? (
        <>
          <div className="input-grid">
            <div className="input-card">
              <div className="card-label">
                <FileText size={18} color="var(--accent-secondary)" />
                Resume PDF
              </div>
              <div
                className="upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  hidden
                  accept=".pdf"
                />
                <Upload size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <span>{file ? file.name : "Click to upload PDF"}</span>
              </div>
            </div>

            <div className="input-card">
              <div className="card-label">
                <Github size={18} color="var(--accent-primary)" />
                GitHub Username
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', height: '160px', justifyContent: 'center' }}>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. octocat"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <p className="input-helper">Public repos will be analyzed for languages & activity.</p>
              </div>
            </div>
          </div>

          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <Sparkles className="spin" size={20} /> : <Sparkles size={20} />}
            {loading ? "Analyzing..." : "Analyze Profile"}
          </button>
        </>
      ) : (
        <div className="results-container">
          <div className="result-card">
            <h3>Stats & Experience</h3>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-label">Level</span>
                <span className="stat-value">{result.experience_level || 'Junior'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Repos</span>
                <span className="stat-value">{result.github_analysis?.repo_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          {result.github_analysis?.language_breakdown && Object.keys(result.github_analysis.language_breakdown).length > 0 && (
            <div className="result-card">
              <h3>GitHub Languages</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(result.github_analysis.language_breakdown).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(result.github_analysis.language_breakdown).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A1D24', border: '1px solid #2D3139', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="result-card">
            <h3>Technical Skills</h3>
            <div className="skills-cloud">
              {result.technical_skills?.map((skill, i) => (
                <span key={i} className="skill-tag tech">{skill}</span>
              ))}
              {(!result.technical_skills || result.technical_skills.length === 0) &&
                result.github_analysis?.primary_languages?.map((lang, i) => (
                  <span key={`lang-${i}`} className="skill-tag tech">{lang}</span>
                ))
              }
            </div>
          </div>

          <div className="result-card">
            <h3>Soft Skills</h3>
            <div className="skills-cloud">
              {result.soft_skills?.map((skill, i) => (
                <span key={i} className="skill-tag soft">{skill}</span>
              ))}
            </div>
          </div>

          <button
            className="analyze-btn"
            onClick={() => setResult(null)}
            style={{ marginTop: '2rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
          >
            Scan Another Profile
          </button>
        </div>
      )}
    </div>
  )
}

const Sidebar = ({ activeTab, setActiveTab, metrics }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile-scan', label: 'Profile Scan', icon: ScanFace },
    { id: 'role-gap', label: 'Role Gap', icon: Target },
    { id: 'quest-map', label: 'Quest Map', icon: Map },
    { id: 'daily-quest', label: 'Eat the Frog', icon: Swords },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
  ]

  const xpProgress = metrics ? (metrics.xp % 500) / 500 * 100 : 0

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <Zap size={28} fill="currentColor" />
        </div>
        <div>
          CareerOS
          <span className="brand-subtitle">CO-PILOT</span>
        </div>
      </div>

      <div className="menu-label">MENU</div>
      <nav className="nav-menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={20} />
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="rank-card">
          <div className="rank-info">
            <span className="rank-title">Rank</span>
            <span className="rank-value text-gradient">{metrics?.rank || 'Unranked'}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${xpProgress}%` }}></div>
          </div>
          <div className="rank-info" style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>LVL {metrics?.level || 1}</span>
            <span>{metrics ? metrics.xp % 500 : 0}/500</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

const DashboardHeader = ({ metrics }) => {
  return (
    <header className="top-header">
      <div className="menu-trigger" style={{ display: 'none' }}>
        <Menu />
      </div>
      <div>
        {/* Breadcrumb or Title could go here */}
      </div>
      <div className="header-actions">
        <div className="fire-badge">
          <Flame size={16} fill="currentColor" />
          {metrics?.streak || 0}
        </div>
        <div className="xp-badge">
          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>XP</span>
          {metrics?.xp || 0} XP
        </div>
      </div>
    </header>
  )
}

const WelcomeSection = ({ metrics }) => {
  const xpProgress = metrics ? (metrics.xp % 500) / 500 * 100 : 0

  return (
    <section className="welcome-card">
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <div className="welcome-badge">
          <div className="star-icon">
            <Award size={32} color="var(--text-muted)" />
          </div>
          <span style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {metrics?.rank || 'unranked'}
          </span>
        </div>

        <div className="welcome-content" style={{ flex: 1 }}>
          <h1>Welcome, <span style={{ color: 'var(--accent-primary)' }}>Adventurer</span></h1>
          <p>Your career quest awaits. Level up by completing daily challenges.</p>

          <div className="level-info">
            <div className="level-text">
              <span>LVL {metrics?.level || 1} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>NEXT LEVEL</span></span>
              <span style={{ color: 'var(--text-muted)' }}>{metrics ? metrics.xp % 500 : 0}/500</span>
            </div>
            <div className="progress-bar" style={{ height: '8px', background: 'var(--bg-primary)' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${xpProgress}%`,
                  background: 'linear-gradient(90deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="streak-circle" style={{ marginLeft: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Flame size={24} fill="currentColor" />
            <span>{metrics?.streak || 0}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

const StatsGrid = ({ metrics }) => {
  const stats = [
    {
      label: 'Quests Done',
      value: metrics ? `${metrics.total_completed_tasks}/${metrics.total_assigned_tasks}` : '0/0',
      subtext: 'Lifetime total',
      icon: Award,
      color: 'var(--accent-secondary)',
      trend: true
    },
    {
      label: 'Rank Tier',
      value: metrics?.rank || 'Unranked',
      subtext: 'Global standing',
      icon: Target,
      color: 'var(--accent-primary)',
      trend: true
    },
    {
      label: 'Day Streak',
      value: metrics ? `${metrics.streak} 🔥` : '0 🔥',
      subtext: 'Consistency',
      icon: Flame,
      color: 'var(--accent-orange)',
      trend: true
    },
    {
      label: 'Execution',
      value: metrics?.execution_score.toFixed(0) || 0,
      subtext: 'Accuracy score',
      icon: TrendingUp,
      color: '#8B5CF6',
      trend: true
    },
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="trend-indicator">▲</div>
          <div className="stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>
            <stat.icon size={20} />
          </div>
          <div className="stat-value">{stat.value}</div>
          <span className="stat-label">{stat.label}</span>
          <p className="stat-subtext">{stat.subtext}</p>
        </div>
      ))}
    </div>
  )
}

const ActionGrid = () => {
  return (
    <div className="action-grid">
      <div className="action-card" onClick={() => (window.location.hash = '#daily-quest')}>
        <div className="action-left">
          <div className="action-icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-secondary)' }}>
            <Swords size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem' }}>Eat the Frog</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+45 XP available</span>
          </div>
        </div>
        <ChevronRight size={20} color="var(--text-muted)" />
      </div>

      <div className="action-card">
        <div className="action-left">
          <div className="action-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
            <ScanFace size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem' }}>Scan Profile</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unlock skill tree</span>
          </div>
        </div>
        <ChevronRight size={20} color="var(--text-muted)" />
      </div>
    </div>
  )
}

const CommunitiesSection = ({ metrics }) => {
  const currentXP = metrics?.xp || 0

  const communities = [
    {
      id: 'beginner',
      name: 'Beginner Community',
      threshold: 500,
      description: 'Start your journey with other novices.',
      tag: 'LEVEL 1+',
      color: 'var(--accent-secondary)',
      discord: 'https://discord.gg/WMjyddhq'
    },
    {
      id: 'intermediate',
      name: 'Intermediate Community',
      threshold: 1000,
      description: 'Step up to more advanced challenges.',
      tag: 'LEVEL 5+',
      color: 'var(--accent-primary)',
      discord: 'https://discord.gg/career-intermediate'
    },
    {
      id: 'advanced',
      name: 'Advanced Community',
      threshold: 2500,
      description: 'Connect with seasoned pros.',
      tag: 'LEVEL 10+',
      color: '#8B5CF6',
      discord: 'https://discord.gg/career-advanced'
    },
    {
      id: 'expert',
      name: 'Expert Community',
      threshold: 5000,
      description: 'Exclusive elite-only space.',
      tag: 'ELITE',
      color: 'gold',
      discord: 'https://discord.gg/career-expert'
    }
  ]

  const joinCommunity = (comm) => {
    if (currentXP >= comm.threshold) {
      window.open(comm.discord, '_blank')
    }
  }

  const unlockedCount = communities.filter(c => currentXP >= c.threshold).length

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <div className="section-title">
        <Users size={20} color="var(--accent-primary)" />
        <h3>Guilds & Communities</h3>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {unlockedCount}/{communities.length} joined
        </span>
      </div>

      <div className="achievement-grid" style={{ marginBottom: '2rem' }}>
        {communities.map((comm) => {
          const isUnlocked = currentXP >= comm.threshold
          return (
            <div
              key={comm.id}
              className={`achievement-card ${isUnlocked ? 'unlocked' : ''}`}
              onClick={() => joinCommunity(comm)}
              style={{
                borderColor: isUnlocked ? comm.color : 'var(--border-color)',
                opacity: isUnlocked ? 1 : 0.4,
                position: 'relative',
                cursor: isUnlocked ? 'pointer' : 'default',
                transition: 'all 0.3s ease'
              }}
            >
              <div className="achievement-icon" style={{
                background: isUnlocked ? `${comm.color}15` : 'var(--bg-primary)',
                color: isUnlocked ? comm.color : 'var(--text-muted)'
              }}>
                <Users size={20} />
              </div>
              <div className="achievement-info">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h4 style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>{comm.name}</h4>
                  <span className="achievement-tag" style={{
                    color: isUnlocked ? comm.color : 'inherit',
                    borderColor: isUnlocked ? comm.color : 'transparent'
                  }}>
                    {comm.tag}
                  </span>
                </div>
                <p className="achievement-desc">
                  {isUnlocked ? comm.description : `Unlock at ${comm.threshold} XP`}
                </p>
              </div>
              {isUnlocked ? (
                <ExternalLink size={14} style={{ position: 'absolute', top: '1rem', right: '1rem', color: comm.color }} />
              ) : (
                <Lock size={14} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const RoleGap = ({ userSkills, gapResult, setGapResult }) => {
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Data Analyst",
    "Machine Learning Engineer"
  ]

  const handleAnalyze = async () => {
    if (!selectedRole) return

    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_skills: userSkills,
          selected_role: selectedRole
        })
      })
      const data = await response.json()
      setGapResult(data)
    } catch (e) {
      console.error(e)
      alert("Gap analysis failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="scan-container">
      <div className="scan-header">
        <div className="scan-title">
          <Target size={32} color="var(--accent-secondary)" />
          <h2>Role Gap Analysis</h2>
        </div>
        <p className="scan-subtitle">Compare your skills against your target role.</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <select
          className="custom-input"
          style={{ height: '50px', fontSize: '1rem', cursor: 'pointer' }}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Select target role</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <button
          className="analyze-btn"
          style={{ marginTop: '1rem', backgroundColor: selectedRole ? 'var(--accent-secondary)' : 'var(--bg-tertiary)', color: selectedRole ? 'var(--bg-primary)' : 'var(--text-muted)' }}
          onClick={handleAnalyze}
          disabled={!selectedRole || loading}
        >
          {loading ? <Sparkles className="spin" size={20} /> : <Target size={20} />}
          {loading ? "Analyzing..." : "Analyze Gap"}
        </button>
      </div>

      {gapResult && (
        <div className="results-container">
          <div className="result-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span className="stat-label">Alignment Score</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: gapResult.alignment_score > 70 ? 'var(--accent-secondary)' : 'var(--accent-orange)' }}>
                {gapResult.alignment_score}%
              </div>
            </div>
            <div style={{ width: 60, height: 60 }}>
              {/* Placeholder for a circular progress if needed */}
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: `4px solid ${gapResult.alignment_score > 70 ? 'var(--accent-secondary)' : 'var(--accent-orange)'}`, opacity: 0.2 }}></div>
            </div>
          </div>

          {gapResult.missing_skills.length > 0 && (
            <div className="result-card">
              <h3>Priority Skills to Learn</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={gapResult.missing_skills.slice(0, 5)}
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2D3139" />
                    <XAxis type="number" stroke="#6B7280" hide />
                    <YAxis
                      dataKey="skill"
                      type="category"
                      stroke="#9CA3AF"
                      width={100}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A1D24', border: '1px solid #2D3139', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="importance" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="result-card">
            <h3>Missing Skills</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {gapResult.missing_skills.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No missing skills found! You are a perfect match.</p>
              ) : (
                gapResult.missing_skills.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.skill}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.why_this_skill_matters}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
                      IMPACT: {item.importance}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const QuestMap = ({ gapResult }) => {
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState(null)

  const handleGenerate = async () => {
    if (!gapResult || !gapResult.missing_skills) return

    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missing_skills: gapResult.missing_skills
        })
      })
      const data = await response.json()
      setRoadmap(data)
    } catch (e) {
      console.error(e)
      alert("Failed to generate roadmap")
    } finally {
      setLoading(false)
    }
  }

  if (!gapResult) {
    return (
      <div className="scan-container">
        <div className="scan-header">
          <div className="scan-title">
            <Map size={32} color="var(--accent-primary)" />
            <h2>Quest Map</h2>
          </div>
          <p className="scan-subtitle">Complete the Role Gap Analysis first to unlock your quest map.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="scan-container">
      <div className="scan-header">
        <div className="scan-title">
          <Map size={32} color="var(--accent-primary)" />
          <h2>Quest Map</h2>
        </div>
        <p className="scan-subtitle">Your personalized 30-day adventure to skill mastery.</p>
      </div>

      {!roadmap ? (
        <div className="result-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            width: '80px', height: '80px', background: 'var(--bg-tertiary)',
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Map size={40} color="var(--accent-primary)" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Generate Quest Map</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Create a personalized plan to conquer your missing skills: {gapResult.missing_skills.slice(0, 3).map(s => s.skill).join(', ')}...
          </p>

          <button
            className="analyze-btn"
            onClick={handleGenerate}
            disabled={loading}
            style={{ maxWidth: '300px', margin: '0 auto' }}
          >
            {loading ? <Sparkles className="spin" size={20} /> : <Sparkles size={20} />}
            {loading ? "Generating Map..." : "Generate Quest Map"}
          </button>
        </div>
      ) : (
        <div className="results-container">
          {/* Roadmap Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="stat-card">
              <span className="stat-label">Duration</span>
              <div className="stat-value">{roadmap.total_days} Days</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Focus Skills</span>
              <div className="stat-value">{roadmap.total_skills}</div>
            </div>
          </div>

          {/* Weeks */}
          {roadmap.roadmap.map((week, i) => (
            <div key={i} className="result-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Week {week.week}: {week.focus_skill}</h3>
                <span className="skill-tag tech">XP: {week.importance * 100}</span>
              </div>

              <div className="quest-list">
                {week.days.map((day, j) => (
                  <div key={j} style={{
                    display: 'flex', gap: '1rem', padding: '10px 0',
                    borderBottom: j < week.days.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <div style={{
                      minWidth: '24px', height: '24px', borderRadius: '50%',
                      border: '2px solid var(--text-muted)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
                      color: 'var(--text-muted)'
                    }}>
                      {day.day}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{day.task}</div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Capstone */}
          <div className="result-card" style={{ border: '1px solid var(--accent-orange)', background: 'rgba(245, 158, 11, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Trophy size={24} color="var(--accent-orange)" />
              <h3 style={{ margin: 0, color: 'var(--accent-orange)' }}>Boss Battle: Capstone Project</h3>
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{roadmap.capstone.task}</h4>
              <p style={{ color: 'var(--text-muted)' }}>{roadmap.capstone.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DailyQuest = ({ onComplete }) => {
  const [questAccepted, setQuestAccepted] = useState(false)
  const [submission, setSubmission] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleAccept = () => {
    setQuestAccepted(true)
  }

  const handleSubmit = async () => {
    if (!submission) return
    setLoading(true)
    try {
      const resp = await fetch('http://127.0.0.1:8000/submit-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "user_1",
          submission_text: submission
        })
      })
      const data = await resp.json()
      setResult(data)
      if (onComplete) onComplete()
    } catch (e) {
      console.error(e)
      alert("Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="scan-container">
      <div className="scan-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="scan-title">
            <Swords size={32} color="var(--accent-primary)" />
            <h2>Eat the Frog</h2>
          </div>
          <p className="scan-subtitle">Complete quests to earn XP and maintain your streak.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>+45 XP</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>reward</div>
        </div>
      </div>

      {!questAccepted ? (
        <div className="result-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            width: '80px', height: '80px', background: 'var(--bg-tertiary)',
            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)'
          }}>
            <Swords size={40} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Accept Quest</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            Tap to receive today's challenge
          </p>

          <button
            className="analyze-btn"
            onClick={handleAccept}
            style={{ maxWidth: '280px', margin: '0 auto' }}
          >
            <Swords size={20} />
            Accept Quest
          </button>
        </div>
      ) : result ? (
        <div className="results-container">
          <div className="result-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '64px', height: '64px', background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Trophy size={32} color="var(--accent-green)" />
            </div>
            <h3 style={{ color: 'var(--accent-green)', marginBottom: '1rem' }}>Quest Completed!</h3>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="stat-card">
                <span className="stat-label">Rating</span>
                <div className="stat-value" style={{ color: result.feedback?.rating > 70 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                  {result.feedback?.rating}/100
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-label">XP</span>
                <div className="stat-value">+{result.xp}</div>
              </div>
              <div className="stat-card">
                <span className="stat-label">Streak</span>
                <div className="stat-value">{result.streak}d</div>
              </div>
            </div>
          </div>

          {result.feedback && (
            <>
              <div className="result-card">
                <h3 style={{ color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Mistakes & Gaps
                </h3>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {result.feedback.mistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="result-card">
                <h3 style={{ color: 'var(--accent-green)' }}>Correct Approach</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {result.feedback.correct_approach}
                </p>
              </div>

              <div className="result-card">
                <h3 style={{ color: 'var(--accent-primary)' }}>How to Improve</h3>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {result.feedback.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <button
            className="analyze-btn"
            onClick={() => {
              setQuestAccepted(false)
              setResult(null)
              setSubmission('')
            }}
            style={{ marginTop: '1rem' }}
          >
            New Quest
          </button>
        </div>
      ) : (
        <div className="result-card">
          <h3>Today's Challenge: System Design Fundamentals</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Explain the difference between vertical and horizontal scaling, and when you would choose one over the other.
          </p>

          <textarea
            className="custom-input"
            style={{ height: '200px', padding: '1rem', resize: 'none', marginBottom: '1.5rem' }}
            placeholder="Write your answer here (min 30 words)..."
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
          />

          <button
            className="analyze-btn"
            onClick={handleSubmit}
            disabled={loading || submission.length < 20}
          >
            {loading ? <Sparkles className="spin" size={20} /> : <Zap size={20} />}
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        </div>
      )}
    </div>
  )
}

const Gauge = ({ value, displayValue, label, color, size = 180 }) => {
  const radius = size * 0.45
  const stroke = size * 0.07
  const normalizedRadius = radius - stroke
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="gauge-outer" style={{ width: size, textAlign: 'center' }}>
      <div className="gauge-container" style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg height={size} width={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <circle
            stroke="var(--bg-tertiary)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="gauge-value" style={{ fontSize: `${size * 0.16}px`, fontWeight: 800, color: 'var(--text-primary)' }}>{displayValue || value}</div>
      </div>
      <div className="gauge-label" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '12px' }}>{label}</div>
    </div>
  )
}

const PlayerStats = ({ metrics }) => {
  if (!metrics) return <div className="loading-state"><Sparkles className="spin" /></div>

  const xpProgress = (metrics.xp % 500) / 500 * 100

  return (
    <div className="scan-container">
      <div className="scan-header">
        <div className="scan-title">
          <BarChart2 size={32} color="var(--accent-primary)" />
          <h2>Player Stats</h2>
        </div>
        <p className="scan-subtitle">Track your progress and climb the ranks.</p>
      </div>

      <div className="result-card career-warrior-card">
        <div className="warrior-badge">
          <Award size={48} color="var(--text-muted)" />
          <div className="warrior-rank-num">{metrics.level}</div>
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="warrior-name">Career Warrior</h3>
          <p className="warrior-track">{metrics.rank || 'Unranked'} · Backend Developer Track</p>

          <div className="level-info" style={{ marginTop: '1.5rem' }}>
            <div className="level-text">
              <span>LVL {metrics.level} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>XP</span></span>
              <span style={{ color: 'var(--text-muted)' }}>{metrics.xp % 500}/500</span>
            </div>
            <div className="progress-bar" style={{ height: '8px', background: 'var(--bg-primary)' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${xpProgress}%`,
                  background: 'linear-gradient(90deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)'
                }}
              ></div>
            </div>
          </div>

          <div className="warrior-stats-row">
            <span><Swords size={14} /> {metrics.total_completed_tasks} quests</span>
            <span><Flame size={14} /> {metrics.streak} streak</span>
            <span><Zap size={14} /> {metrics.execution_score.toFixed(0)} exec</span>
          </div>
        </div>
      </div>

      <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="result-card" style={{ height: '360px' }}>
          <h3>Knowledge Map</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={metrics.knowledge_map}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {metrics.knowledge_map.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="result-card" style={{ height: '360px' }}>
          <h3>Skill Proficiency</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={Object.entries(metrics.skill_distribution).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
                {Object.entries(metrics.skill_distribution).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="result-card" style={{ height: '360px' }}>
          <h3>Skill Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={Object.entries(metrics.skill_distribution).map(([name, value]) => ({ subject: name, A: value, fullMark: 100 }))}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Skills"
                dataKey="A"
                stroke="var(--accent-primary)"
                fill="var(--accent-primary)"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="result-card" style={{ height: '360px' }}>
          <h3>Activity Curve</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart
              data={metrics.activity_log}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--accent-secondary)' }}
              />
              <Area type="monotone" dataKey="xp" stroke="var(--accent-secondary)" fillOpacity={1} fill="url(#colorXp)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="gauges-wrapper">
        <Gauge value={(metrics.total_completed_tasks / (metrics.total_assigned_tasks || 1) * 100).toFixed(0)} label="Quest Completion" color="var(--accent-primary)" size={180} />
        <Gauge value={metrics.execution_score.toFixed(0)} label="Execution Score" color="#8B5CF6" size={180} />
        <Gauge
          value={xpProgress}
          displayValue={500 - (metrics.xp % 500)}
          label="XP To Next LVL"
          color="#F59E0B"
          size={180}
        />
      </div>
    </div>
  )
}

export default App
