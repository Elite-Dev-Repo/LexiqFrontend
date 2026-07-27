import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../lib/api'
import { toast } from 'sonner'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000'
const MAX_RETRIES = 20

const INITIAL = {
  phase: 'connecting',
  code: null,
  members: [],
  isHost: false,
  question: null,
  questionIndex: 0,
  totalQuestions: 0,
  timeLimit: 10,
  answerResult: null,
  scores: [],
  results: [],
  error: null,
  questionStart: null,
}

export default function useRoomSocket(roomCodeFromUrl) {
  const [state, setState] = useState(INITIAL)
  const wsRef = useRef(null)
  const genRef = useRef(0)
  const retriesRef = useRef(0)
  const timerRef = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const update = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const connect = useCallback(() => {
    const gen = ++genRef.current

    const token = api.getToken()
    if (!token) {
      update({ phase: 'error', error: 'Not authenticated' })
      return
    }

    const url = `${WS_BASE}/ws/room/?token=${token}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (genRef.current !== gen) return
      retriesRef.current = 0
      const code = stateRef.current.code || roomCodeFromUrl
      if (code) {
        ws.send(JSON.stringify({ type: 'join_room', code }))
      }
    }

    ws.onmessage = (event) => {
      if (genRef.current !== gen) return
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }

      switch (msg.type) {
        case 'error':
          toast.error(msg.message)
          update({ error: msg.message })
          break

        case 'room_created':
          update({
            code: msg.code,
            members: msg.room.members,
            isHost: true,
            phase: 'lobby',
          })
          break

        case 'room_joined':
          update({
            code: msg.code,
            members: msg.members,
            isHost: msg.is_host,
            phase: msg.phase === 'playing' ? 'question' : 'lobby',
          })
          break

        case 'game_state':
          update({
            questionIndex: msg.current_index + 1,
            totalQuestions: msg.total_questions,
            scores: msg.scores || [],
          })
          break

        case 'player_joined':
          update({ members: msg.members })
          break

        case 'player_left':
          update({ members: msg.members })
          break

        case 'player_disconnected':
          if (msg.members) update({ members: msg.members })
          break

        case 'game_started':
          update({
            phase: 'question',
            totalQuestions: msg.total_questions,
            timeLimit: msg.time_limit,
            answerResult: null,
            scores: [],
            results: [],
          })
          break

        case 'question':
          update({
            phase: 'question',
            question: msg.question,
            questionIndex: msg.question_index,
            totalQuestions: msg.total,
            timeLimit: msg.time_limit,
            answerResult: null,
            questionStart: Date.now(),
          })
          break

        case 'answer_result':
          update({ answerResult: msg, phase: 'answered' })
          break

        case 'score_update':
          update({ scores: msg.scores })
          break

        case 'game_ended':
          update({ phase: 'results', results: msg.results })
          break

        default:
          break
      }
    }

    ws.onclose = (event) => {
      if (genRef.current !== gen) return
      wsRef.current = null

      if (event.code === 4001) {
        api.tryRefresh().then((ok) => {
          if (ok && genRef.current === gen) connect()
          else update({ phase: 'error', error: 'Session expired. Please log in again.' })
        })
        return
      }

      const s = stateRef.current
      if (s.phase === 'results') return

      retriesRef.current += 1
      if (retriesRef.current > MAX_RETRIES) {
        update({ phase: 'error', error: 'Connection lost. Please refresh.' })
        return
      }

      update({ phase: 'disconnected' })

      const delay = Math.min(1000 * 2 ** Math.min(retriesRef.current, 6), 30000)
      timerRef.current = setTimeout(() => {
        if (genRef.current === gen) connect()
      }, delay)
    }

    ws.onerror = () => {
      if (genRef.current !== gen) return
      ws.close()
    }
  }, [roomCodeFromUrl, update])

  useEffect(() => {
    connect()
    return () => {
      genRef.current += 1
      clearTimeout(timerRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const createRoom = useCallback((questionDeckId, timeLimit = 10) => {
    send({ type: 'create_room', question_deck_id: questionDeckId, time_limit: timeLimit })
  }, [send])

  const joinRoom = useCallback((code) => {
    send({ type: 'join_room', code })
  }, [send])

  const startGame = useCallback(() => {
    send({ type: 'start_game' })
  }, [send])

  const submitAnswer = useCallback((optionId) => {
    send({ type: 'submit_answer', option_id: optionId })
  }, [send])

  const leaveRoom = useCallback(() => {
    send({ type: 'leave_room' })
    clearTimeout(timerRef.current)
    retriesRef.current = Infinity
    genRef.current += 1
    wsRef.current?.close()
    wsRef.current = null
  }, [send])

  return { state, createRoom, joinRoom, startGame, submitAnswer, leaveRoom }
}
