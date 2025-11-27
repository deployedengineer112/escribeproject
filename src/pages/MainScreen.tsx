import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, Menu } from 'lucide-react'
import PatientList from './PatientList'
import { LoginModal } from '../components/LoginModal'
import { PatientInfoPanel } from '../components/PatientInfoPanel'
import { RecordingControls } from '../components/RecordingControls'
import { PlaybackControls } from '../components/PlaybackControls'
import { TabNavigation } from '../components/TabNavigation'
import { LiveTranscription } from '../components/LiveTranscription'
import { ActionButtons } from '../components/ActionButtons'
import { PopperNotice } from '../components/PopperNotice'
import { SoapNotesModal } from '../components/SoapNotesModal'
import { SoapNotePanel } from '../components/SoapNotePanel'
import { PatientOptionsSheet } from '../components/PatientOptionsSheet'

export function MainScreen() {
  const API_BASE = import.meta.env.VITE_API_URL
  const [activeTab, setActiveTab] = useState('Dictation')
  const [noticeVisible, setNoticeVisible] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState('')
  const [noticeVariant, setNoticeVariant] = useState<'started' | 'paused' | 'stopped'>('started')

  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle')
  const isRecording = recordingStatus === 'recording'

  const [soapOpen, setSoapOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(true)
  const [showPatients, setShowPatients] = useState(false)
  const [patient, setPatient] = useState<{ id: string, name: string, dob: string, age: number, provider: string } | null>(null)
  const [transcript, setTranscript] = useState<{ speaker: string, text: string }[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [panelsOnTop, setPanelsOnTop] = useState(false)
  const [panelsFill, setPanelsFill] = useState(false)
  

  const handleStarted = useCallback(() => {
    setNoticeMessage('Recording Started')
    setNoticeVariant('started')
    setNoticeVisible(true)
    setRecordingStatus('recording')
  }, [])

  const handlePaused = useCallback(() => {
    setNoticeMessage('Recording Paused')
    setNoticeVariant('paused')
    setNoticeVisible(true)
    setRecordingStatus('paused')
  }, [])

  const handleStopped = useCallback(() => {
    if (recordingStatus !== 'stopped') {
      setNoticeMessage('Recording Stopped')
      setNoticeVariant('stopped')
      setNoticeVisible(true)
      setRecordingStatus('stopped')
      setSoapOpen(true)
    }
  }, [recordingStatus])

  // 🔥 FIX: stable onClose so modal does not reopen infinitely
  const handleSoapClose = useCallback(() => {
    setSoapOpen(false)
    setRecordingStatus('idle')
  }, [])

  useEffect(() => {
    if (!patient) return
    fetch(`${API_BASE}/api/patient/${patient.id}/recording`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('escribe.token') || ''}` }
    })
      .then(async (r) => {
        if (!r.ok) {
          setAudioUrl(null)
          return null
        }
        const b = await r.blob()
        if (b && b.size > 0) {
          const url = URL.createObjectURL(b)
          setAudioUrl(url)
        } else {
          setAudioUrl(null)
        }
        return null
      })
      .catch(() => { setAudioUrl(null) })
  }, [patient, API_BASE])

  useEffect(() => {
    if (!noticeVisible) return
    const id = setTimeout(() => setNoticeVisible(false), 3000)
    return () => clearTimeout(id)
  }, [noticeVisible])

  useEffect(() => {
    fetch(`${API_BASE}/api/transcript`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('escribe.token') || ''}` }
    })
      .then(r => r.json())
      .then((t) => {
        const arr = Array.isArray(t) ? t : []
        setTranscript(arr)
      })
      .catch(() => {})
  }, [API_BASE])

  if (loginOpen && !showPatients) {
    return (
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={async (email, password) => {
          try {
            const res = await fetch(`${API_BASE}/api/signin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            })
            if (res.ok) {
              setLoginOpen(false)
              setShowPatients(true)
              setNoticeMessage('Signed In')
              setNoticeVariant('started')
              setNoticeVisible(true)
            } else {
              setNoticeMessage('Invalid credentials')
              setNoticeVariant('stopped')
              setNoticeVisible(true)
            }
          } catch {
            setNoticeMessage('Sign in failed')
            setNoticeVariant('stopped')
            setNoticeVisible(true)
          }
        }}
      />
    )
  }

  if (showPatients) {
    return <PatientList onSelect={(p) => { setPatient(p); setShowPatients(false) }} />
  }

  return (
    <div className="max-w-sm mx-auto p-4 relative">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full w-9 h-9 text-gray-600 hover:text-gray-800"
          onClick={() => {
            setAudioUrl(null)
            setRecordingStatus('idle')
            setPatient(null)
            setShowPatients(true)
          }}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-lg font-bold text-blue-600">eScribe</div>
        <button type="button" className="inline-flex items-center justify-center rounded-full w-9 h-9 text-gray-600 hover:text-gray-800">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      

      {/* PATIENT PANEL */}
      {patient && (
        <PatientInfoPanel
          className="mt-4"
          patientName={patient.name}
          dob={patient.dob}
          age={patient.age}
          id={patient.id}
          provider={patient.provider}
          onMenuClick={() => setOptionsOpen(true)}
        />
      )}

      {/* NOTICE */}
      <PopperNotice
        visible={noticeVisible}
        message={noticeMessage}
        variant={noticeVariant}
        onClose={() => setNoticeVisible(false)}
        inContainer={true}
      />

      {panelsOnTop && (
        <>
          <TabNavigation
            tabs={["Dictation", "SOAP Note"]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isRecording={isRecording}
            onExpandTop={() => setPanelsOnTop(true)}
            onCollapseBottom={() => setPanelsOnTop(false)}
            onHandleClick={() => setPanelsOnTop(v => !v)}
            onFillExpand={() => setPanelsFill(true)}
            onFillCollapse={() => setPanelsFill(false)}
          />
          <div className={`${panelsFill ? 'overflow-auto' : ''}`} style={panelsFill ? { height: 'calc(100vh - 220px)' } : undefined}>
            {activeTab === 'Dictation'
              ? <LiveTranscription status={isRecording ? 'Live' : 'Offline'} transcript={transcript} />
              : <SoapNotePanel />
            }
          </div>
        </>
      )}

      {!panelsOnTop && (
        <>
          {patient && (
            audioUrl ? (
              <PlaybackControls
                url={audioUrl}
                onClose={() => {
                  setAudioUrl(null)
                  setRecordingStatus('idle')
                }}
              />
            ) : (
              <RecordingControls
                status={recordingStatus}
                timer="00:00"
                onStarted={handleStarted}
                onPaused={handlePaused}
                onStopped={handleStopped}
                onAudioReady={async (url) => {
                  if (!patient) return
                  try {
                    const res = await fetch(`${API_BASE}/api/patient/${patient.id}/recording`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('escribe.token') || ''}` },
                      body: JSON.stringify({ dataUrl: url })
                    })
                    if (res.ok) {
                      const r2 = await fetch(`${API_BASE}/api/patient/${patient.id}/recording`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('escribe.token') || ''}` }
                      })
                      if (r2.ok) {
                        const b = await r2.blob()
                        if (b && b.size > 0) {
                          const u = URL.createObjectURL(b)
                          setAudioUrl(u)
                        } else {
                          setAudioUrl(null)
                        }
                      } else {
                        setAudioUrl(null)
                      }
                    }
                  } catch {
                    setAudioUrl(null)
                  }
                }}
              />
            )
          )}
          
        </>
      )}

      {/* TABS */}
      {!panelsOnTop && (
        <>
          <TabNavigation
            tabs={["Dictation", "SOAP Note"]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isRecording={isRecording}
            onExpandTop={() => setPanelsOnTop(true)}
            onCollapseBottom={() => setPanelsOnTop(false)}
            onHandleClick={() => setPanelsOnTop(v => !v)}
            onFillExpand={() => setPanelsFill(true)}
            onFillCollapse={() => setPanelsFill(false)}
          />
          <div className={`${panelsFill ? 'overflow-auto' : ''}`} style={panelsFill ? { height: 'calc(100vh - 220px)' } : undefined}>
            {activeTab === 'Dictation'
              ? <LiveTranscription status={isRecording ? 'Live' : 'Offline'} transcript={transcript} />
              : <SoapNotePanel />
            }
          </div>
        </>
      )}

      {/* SOAP MODAL */}
      {soapOpen && (
        <SoapNotesModal
          open={soapOpen}
          onClose={handleSoapClose}  // FIXED: stable reference
        />
      )}

      {/* LOGIN */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={async (email, password) => {
          try {
            const res = await fetch(`${API_BASE}/api/signin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            })
             if (res.ok) {
               const json = await res.json()
               if (json && typeof json.token === 'string') {
                 localStorage.setItem('escribe.token', json.token)
               }
               setLoginOpen(false)
               setShowPatients(true)
               setNoticeMessage('Signed In')
               setNoticeVariant('started')
               setNoticeVisible(true)
             } else {
              setNoticeMessage('Invalid credentials')
              setNoticeVariant('stopped')
              setNoticeVisible(true)
            }
          } catch {
            setNoticeMessage('Sign in failed')
            setNoticeVariant('stopped')
            setNoticeVisible(true)
          }
        }}
      />

      {/* OPTIONS */}
      <PatientOptionsSheet
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        onCopy={() => {
          navigator.clipboard.writeText(
            'Patient: Eleanor Pena, ID: 10000, Provider: Dr. Sarah Jones'
          )
          setOptionsOpen(false)
        }}
        onSavePdf={() => {
          setOptionsOpen(false)
          alert('Save PDF')
        }}
        onTransfer={() => {
          setOptionsOpen(false)
          alert('Transfer to EHR')
        }}
      />

      {/* FOOTER */}
      <ActionButtons buttons={["Finalize", "Transfer"]} />

      

      {/* Find/Create patient flows happen in PatientList screen */}

    </div>
  )
}
