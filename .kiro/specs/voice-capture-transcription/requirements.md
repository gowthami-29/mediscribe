# Requirements Document

## Introduction

This document covers the three missing capabilities in the Voice Capture & Transcription module of ArogyaScribe (MediScribe). The platform is an Electron-wrapped medical documentation app with a React/TypeScript/Zustand frontend and a FastAPI/PostgreSQL backend. Voice recording is handled by the browser's `MediaRecorder` API, and live transcription is streamed via the AssemblyAI v3 WebSocket API.

The following features are already implemented and are **out of scope**:
- One-click voice recording start
- Real-time transcription display (AssemblyAI v3 partial Turn messages)
- Stop recording control

The three features in scope are:
1. **Pause / Resume** recording controls
2. **Auto-save** transcription to local database every 30 seconds during recording
3. **Offline operation** with sync when internet is restored

---

## Glossary

- **Recording_Controller**: The `useRecording` hook (`frontend/src/hooks/useRecording.ts`) that manages `MediaRecorder`, `AudioContext`, `AudioWorkletNode`, and the AssemblyAI WebSocket.
- **Recording_Panel**: The `RecordingPanel` React component (`frontend/src/components/consultations/RecordingPanel.tsx`) that renders recording controls and the live transcript.
- **Consultation_Store**: The Zustand store (`frontend/src/store/consultationStore.ts`) that holds `isRecording`, `transcript`, `liveText`, and `recSeconds`.
- **Auto_Save_Service**: The client-side service responsible for persisting in-progress transcript snapshots to the backend on a 30-second interval.
- **Draft_Endpoint**: The FastAPI endpoint that accepts partial transcript saves for an in-progress consultation.
- **Offline_Queue**: A client-side persistent queue (IndexedDB or localStorage) that stores failed or deferred save payloads when the device has no internet connectivity.
- **Sync_Manager**: The client-side module that monitors network connectivity and flushes the Offline_Queue when connectivity is restored.
- **AssemblyAI_Session**: The active AssemblyAI v3 WebSocket connection used for streaming PCM audio and receiving Turn messages.
- **PCM_Worklet**: The `AudioWorkletNode` running `pcm-processor.js` that captures raw PCM frames and forwards them to the AssemblyAI_Session.
- **Practitioner**: A logged-in user with the role `practitioner` or `admin` who conducts consultations.

---

## Requirements

### Requirement 1: Pause Recording

**User Story:** As a Practitioner, I want to pause an active recording, so that I can temporarily stop capturing audio without ending the consultation session.

#### Acceptance Criteria

1. WHEN the Recording_Panel is in the `recording` phase, THE Recording_Panel SHALL display a Pause button alongside the existing Stop button.
2. WHEN the Practitioner activates the Pause button, THE Recording_Controller SHALL call `MediaRecorder.pause()` to suspend audio chunk collection.
3. WHEN the Practitioner activates the Pause button, THE Recording_Controller SHALL suspend the PCM_Worklet from sending audio frames to the AssemblyAI_Session by setting a `paused` flag checked before each `WebSocket.send()` call.
4. WHEN the Practitioner activates the Pause button and `isRecording` is currently `true` at the time the pause is processed, THE Consultation_Store SHALL set `isRecording` to `false` and `isPaused` to `true`.
5. WHEN the Practitioner activates the Pause button, THE Recording_Panel SHALL display a visual indicator (e.g., a pulsing pause icon) and the status label "PAUSED".
6. WHILE the Consultation_Store `isPaused` flag is `true`, THE Recording_Controller SHALL keep the elapsed-time timer frozen at its current value.
7. WHEN the pause operation fully completes and `isPaused` is `true`, THE Recording_Panel SHALL replace the Pause button with a Resume button.

---

### Requirement 2: Resume Recording

**User Story:** As a Practitioner, I want to resume a paused recording, so that I can continue capturing audio in the same consultation session without losing previously recorded content.

#### Acceptance Criteria

1. WHEN the Practitioner activates the Resume button, THE Recording_Controller SHALL call `MediaRecorder.resume()` to restart audio chunk collection.
2. WHEN the Practitioner activates the Resume button, THE Recording_Controller SHALL clear the `paused` flag so that the PCM_Worklet resumes forwarding audio frames to the AssemblyAI_Session.
3. WHEN the Practitioner activates the Resume button, THE Consultation_Store SHALL set `isRecording` to `true` and `isPaused` to `false`.
4. WHEN the Practitioner activates the Resume button, THE Recording_Controller SHALL restart the elapsed-time timer from the value at which it was frozen.
5. WHEN the Practitioner activates the Resume button, THE Recording_Panel SHALL revert to the `recording` phase UI, showing the Pause button and the "LIVE RECORDING" status label.
6. IF the AssemblyAI_Session WebSocket is closed at the time of resume, THEN THE Recording_Controller SHALL re-establish the AssemblyAI_Session before resuming PCM frame forwarding.

---

### Requirement 3: Auto-Save Transcription During Recording

**User Story:** As a Practitioner, I want the in-progress transcription to be saved automatically every 30 seconds, so that no more than 30 seconds of transcribed text is lost if the session is interrupted unexpectedly.

#### Acceptance Criteria

1. WHEN a recording session starts, THE Auto_Save_Service SHALL start a 30-second interval timer.
2. WHEN the 30-second interval elapses and the Consultation_Store `transcript` value has changed since the last save, THE Auto_Save_Service SHALL send the current `transcript` value to the Draft_Endpoint via an HTTP PATCH request.
3. WHEN the 30-second interval elapses and the Consultation_Store `transcript` value has not changed since the last save, THE Auto_Save_Service SHALL skip the network request.
4. WHEN the recording session stops or is paused, THE Auto_Save_Service SHALL perform one final save of the current `transcript` value, then suspend the interval timer (preserving the remaining time) before clearing the interval reference.
5. WHEN the recording session is resumed after a pause, THE Auto_Save_Service SHALL restart the interval timer using the remaining time that was preserved at pause time.
6. IF the Draft_Endpoint returns an HTTP error response, THEN THE Auto_Save_Service SHALL enqueue the failed payload in the Offline_Queue and display a non-blocking warning toast to the Practitioner. THE Auto_Save_Service SHALL NOT display a warning toast when no network request was attempted (e.g., when transcript has not changed).
7. THE Draft_Endpoint SHALL accept a PATCH request to `/consultations/{consultation_id}/draft` with a JSON body containing `transcription_text` (string) and `updated_at` (ISO-8601 timestamp).
8. WHEN the Draft_Endpoint receives a valid PATCH request, THE Draft_Endpoint SHALL update the `transcription_text` and `updated_at` fields of the matching Consultation record and return HTTP 200.
9. IF the `consultation_id` in the PATCH request does not exist or does not belong to the authenticated user's organization, THEN THE Draft_Endpoint SHALL return HTTP 404.

---

### Requirement 4: Offline Operation

**User Story:** As a Practitioner, I want the app to continue recording and saving transcription data when the internet is unavailable, so that I can complete a consultation in a low-connectivity environment without losing data.

#### Acceptance Criteria

1. WHEN the device loses internet connectivity during a recording session, THE Recording_Controller SHALL continue capturing audio via `MediaRecorder` and the local `AudioContext` pipeline without interruption.
2. WHEN the device loses internet connectivity during a recording session, THE Auto_Save_Service SHALL immediately enqueue each save payload in the Offline_Queue rather than attempting a network request.
3. WHEN the device loses internet connectivity, THE Recording_Panel SHALL display a non-blocking connectivity warning banner indicating that auto-saves are queued locally.
4. WHEN the AssemblyAI_Session WebSocket closes due to loss of connectivity, THE Recording_Controller SHALL log the disconnection and continue buffering audio chunks via `MediaRecorder` so that the final audio blob remains intact for post-session upload.
5. WHEN internet connectivity is restored, THE Sync_Manager SHALL flush all payloads from the Offline_Queue by sending them to the Draft_Endpoint in chronological order.
6. WHEN the Sync_Manager successfully delivers a queued payload, THE Sync_Manager SHALL remove that payload from the Offline_Queue.
7. IF a queued payload fails delivery after connectivity is restored, THEN THE Sync_Manager SHALL retain the payload in the Offline_Queue and retry on the next connectivity-restored event.
8. WHEN internet connectivity is restored during an active recording session, THE Recording_Controller SHALL attempt to re-establish the AssemblyAI_Session to resume live transcription.
9. WHEN the Practitioner stops a recording that was captured entirely offline, THE Recording_Panel SHALL upload the final audio blob to the existing `/consultations/{consultation_id}/end` endpoint once connectivity is available, queuing the upload in the Offline_Queue if connectivity is still absent at stop time.
10. THE Offline_Queue SHALL persist across page reloads using IndexedDB so that queued payloads survive an accidental browser or Electron window refresh.
