import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Theme,
  Avatar,
  InputAdornment,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { styled } from '@mui/material/styles'
import { AppHeader } from './AppHeader'

// Main container holding both chat and logs
const MainContentContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  position: 'relative',
}))

// Header container to span across everything
const HeaderContainer = styled(Box)(() => ({
  width: '100%',
}))

// Content container for chat and logs
const ContentContainer = styled(Box)(() => ({
  display: 'flex',
  flex: 1,
  height: 'calc(100vh - 64px)', // Account for header height
  overflow: 'hidden',
}))

// Chat container with input and messages
const ChatFlowContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%',
  overflow: 'hidden',
}))

// Chat-related styled components
const MessagesContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#FFFFFF',
  margin: theme.spacing(2, 2, 0, 2),
  borderRadius: '12px 12px 0 0',
  borderBottom: 'none',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#E0E0E0',
    borderRadius: '3px',
  },
}))

// Log panel styled components
const LogPanelContainer = styled(Box)(() => ({
  width: '600px',
  height: '100%',
  maxHeight: 'calc(100vh - 64px)', // Account for header height
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#FAFAFA',
  boxShadow: '-1px 0 5px rgba(0, 0, 0, 0.05)',
}))

const LogContent = styled(Box)(({ theme }: { theme: Theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  paddingTop: 0,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#E0E0E0',
    borderRadius: '4px',
  },
}))

const LogHeader = styled(Typography)(({ theme }: { theme: Theme }) => ({
  fontWeight: 600,
  fontSize: '14px',
  color: '#555555',
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderBottom: '1px solid #EEEEEE',
  position: 'sticky',
  top: 0,
  backgroundColor: '#FAFAFA',
  zIndex: 10,
  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
}))

const LogEntry = styled(Box)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  backgroundColor: '#F0F0F0',
  borderRadius: '8px',
  color: '#666666',
  fontFamily: 'monospace',
  fontSize: '12px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxWidth: '100%',
  overflowX: 'hidden',
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  lineHeight: '1.5',
}))

// Add new styled components for enhanced logs
const ApiLogEntry = styled(Box)(({ theme }: { theme: Theme }) => ({
  marginBottom: theme.spacing(1.5),
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  width: '100%',
  maxWidth: '100%',
  transition: 'box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.15)',
  },
}))

const ApiLogHeader = styled(Box)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderBottom: '1px solid #EEEEEE',
  width: '100%',
  backgroundColor: '#F8F8F8',
}))

const ApiPath = styled(Typography)(({ theme }: { theme: Theme }) => ({
  fontWeight: 600,
  fontSize: '13px',
  color: '#333333',
  maxWidth: '70%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  paddingRight: theme.spacing(1),
}))

const MethodChip = styled(Box)<{ method: string }>(
  ({ theme, method }: { theme: Theme; method: string }) => ({
    padding: theme.spacing(0.5, 1),
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    backgroundColor:
      method === 'GET'
        ? '#E3F2FD'
        : method === 'POST'
          ? '#E8F5E9'
          : method === 'PUT'
            ? '#FFF8E1'
            : method === 'DELETE'
              ? '#FFEBEE'
              : '#F5F5F5',
    color:
      method === 'GET'
        ? '#0D47A1'
        : method === 'POST'
          ? '#1B5E20'
          : method === 'PUT'
            ? '#F57F17'
            : method === 'DELETE'
              ? '#B71C1C'
              : '#424242',
  })
)

const JsonDisplay = styled('pre')(({ theme }: { theme: Theme }) => ({
  margin: 0,
  fontSize: '12px',
  maxWidth: '100%',
  wordWrap: 'break-word',
  whiteSpace: 'pre-wrap',
  overflowX: 'hidden',
  lineHeight: '1.5',
  backgroundColor: '#FFFFFF',
  padding: theme.spacing(1.5),
  borderRadius: '4px',
  border: '1px solid #EEEEEE',
  color: '#424242',
  fontFamily: '"Menlo", "Monaco", "Consolas", monospace',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
}))

const ApiLogBody = styled(Box)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(2),
  fontSize: '12px',
  backgroundColor: '#FAFAFA',
  color: '#555555',
  fontFamily: 'monospace',
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden',
  borderTop: '1px solid #EEEEEE',
}))

const UserAvatar = styled(Avatar)(() => ({
  width: 48,
  height: 48,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  flexShrink: 0,
}))

const MessageBubble = styled(Box)<{ isUser: boolean }>(
  ({ theme, isUser }: { theme: Theme; isUser: boolean }) => ({
    maxWidth: '100%',
    padding: theme.spacing(1.5, 2),
    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    marginBottom: theme.spacing(0.5),
    backgroundColor: isUser ? '#E3F2FD' : '#F5F5F5',
    color: '#333333',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    fontSize: '14px',
    lineHeight: 1.5,
  })
)

const VideoContainer = styled(Box)<{ isUser: boolean }>(
  ({ theme, isUser }: { theme: Theme; isUser: boolean }) => ({
    maxWidth: '80%',
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    alignSelf: isUser ? 'flex-end' : 'flex-start',
  })
)

const FileContainer = styled(Box)<{ isUser: boolean }>(
  ({ isUser }: { theme: Theme; isUser: boolean }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: isUser ? 'flex-end' : 'flex-start',
    width: '100%',
  })
)

const FileButton = styled(Paper)<{ isUser: boolean }>(
  ({ theme }: { theme: Theme; isUser: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: '#F5F5F5',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    maxWidth: '300px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)',
    },
  })
)

const InputContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5, 2, 1.5, 2),
  backgroundColor: '#FFFFFF',
  margin: theme.spacing(0, 2, 2, 2),
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
}))

const MessageText = styled(Box)<{ isUser: boolean }>(
  ({ theme }: { theme: Theme; isUser: boolean }) => ({
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: 1.5,
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 400,
    color: '#333333',
    '& strong, & b': {
      fontWeight: 600,
    },
    '& em, & i': {
      fontStyle: 'italic',
    },
    '& ul, & ol': {
      paddingLeft: theme.spacing(2.5),
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
    '& li': {
      marginBottom: theme.spacing(0.5),
    },
  })
)

const ThinkingBubble = styled(Box)(({ theme }: { theme: Theme }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5),
  borderRadius: '18px 18px 18px 4px',
  marginBottom: theme.spacing(0.5),
  backgroundColor: '#F5F5F5',
  color: '#000000',
  alignSelf: 'flex-start',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
}))

const ThinkingDots = styled(Box)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}))

const ThinkingDot = styled('span')<{ delay: string }>(
  ({ delay }: { theme: Theme; delay: string }) => ({
    width: '8px',
    height: '8px',
    backgroundColor: '#999999',
    borderRadius: '50%',
    opacity: 0.7,
    animation: 'thinking-dot-bounce 1.4s infinite',
    animationDelay: delay,
    '@keyframes thinking-dot-bounce': {
      '0%, 100%': {
        transform: 'translateY(0)',
      },
      '50%': {
        transform: 'translateY(-5px)',
      },
    },
  })
)

const ChatInput = styled(TextField)(({ theme }: { theme: Theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: '#F5F5F5',
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1.5),
    fontSize: '14px',
    color: '#333333',
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#999999',
    opacity: 1,
    fontWeight: 400,
  },
}))

const MessageRow = styled(Box)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  width: '100%',
  alignItems: 'flex-start',
}))

const Footer = styled(Box)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(0.5, 0),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#999999',
  fontSize: '11px',
  marginBottom: theme.spacing(0.5),
}))

const FooterLink = styled('a')(() => ({
  color: '#2196F3',
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
  },
}))

interface MediaItem {
  title: string
  poster: string
  url: string
}

interface FileItem {
  name: string
  url: string
  type?: string
  size?: number
}

interface Message {
  text: string
  isUser: boolean
  type?: string
  media?: MediaItem[]
  files?: FileItem[]
}

interface FileButtonComponentProps {
  file: FileItem
  isUser: boolean
  onDownload?: (url: string, filename: string) => void
}

const FileButtonComponent: React.FC<FileButtonComponentProps> = ({
  file,
  isUser,
}) => {
  return (
    <a
      href={file.url}
      download={file.name}
      target="_blank"
      style={{ textDecoration: 'none' }}
    >
      <FileButton isUser={isUser} sx={{ cursor: 'pointer' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box
            component="span"
            sx={{
              mr: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.05)',
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#000000',
              }}
            >
              {file.name.slice(-3)}
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight: 'medium',
                color: '#000000',
              }}
            >
              {file.name}
            </Typography>
            {file.size && (
              <Typography
                variant="caption"
                sx={{
                  color: '#666666',
                }}
              >
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            )}
          </Box>
          <Box
            component="span"
            sx={{
              ml: 1,
              color: '#000000',
              fontSize: '1.2rem',
            }}
          >
            ↓
          </Box>
        </Box>
      </FileButton>
    </a>
  )
}

// Update log message handling
interface ApiLogInfo {
  apiPath: string
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | string
  parameters?: any
  requestBody?: any
}

const ApiLogComponent: React.FC<{ logText: string }> = ({ logText }) => {
  let apiLogInfo: ApiLogInfo | null = null

  try {
    apiLogInfo = JSON.parse(logText)
  } catch (e) {
    // Not JSON or not in expected format
    return <LogEntry>{logText}</LogEntry>
  }

  // Check if it has the expected structure
  if (!apiLogInfo?.apiPath || !apiLogInfo?.httpMethod) {
    return <LogEntry>{logText}</LogEntry>
  }

  const hasBody =
    apiLogInfo.requestBody && Object.keys(apiLogInfo.requestBody).length > 0
  const hasParams =
    apiLogInfo.parameters && Object.keys(apiLogInfo.parameters).length > 0

  return (
    <ApiLogEntry>
      <ApiLogHeader>
        <ApiPath>{apiLogInfo.apiPath}</ApiPath>
        <MethodChip method={apiLogInfo.httpMethod}>
          {apiLogInfo.httpMethod}
        </MethodChip>
      </ApiLogHeader>
      {(hasBody || hasParams) && (
        <ApiLogBody>
          {hasParams && (
            <>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  color: '#424242',
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Parameters:
              </Typography>
              <JsonDisplay>
                {JSON.stringify(apiLogInfo.parameters, null, 2)}
              </JsonDisplay>
            </>
          )}
          {hasBody && (
            <>
              {hasParams && <Box sx={{ height: '16px' }} />}
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  color: '#424242',
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Request Body:
              </Typography>
              <JsonDisplay>
                {JSON.stringify(apiLogInfo.requestBody, null, 2)}
              </JsonDisplay>
            </>
          )}
        </ApiLogBody>
      )}
    </ApiLogEntry>
  )
}

export function Chat() {
  const [sessionId] = useState<string>(crypto.randomUUID())
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Howdy! What can I do for you today?',
      isUser: false,
    },
  ])
  const [logMessages, setLogMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToBottomLogs = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    scrollToBottomLogs()
  }, [logMessages])

  const connectWebSocket = (): WebSocket | null => {
    const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL!

    console.log('WebSocket URL:', websocketUrl)
    if (!websocketUrl) {
      console.error('WebSocket URL not found in environment variables')
      return null
    }

    const websocket = new WebSocket(websocketUrl)
    console.log('WebSocket instance created')

    websocket.onopen = () => {
      console.log('WebSocket connection established')
    }

    websocket.onmessage = (event) => {
      console.log('Raw message received:', event.data)
      try {
        const response = JSON.parse(event.data)
        console.log('Parsed message:', response)

        // This is just a quick-win to avoid having to do a proxy Lambda to handle the timeout from API Gateway
        if (response.message === 'Endpoint request timed out') {
          return
        }

        // Handle log messages separately
        if (response.type === 'log') {
          setLogMessages((prev) => [
            ...prev,
            {
              text: response.message || response.text,
              isUser: false,
              type: 'log',
            },
          ])
        } else {
          // Always reset thinking state regardless of message type
          setIsThinking(false)
          // Handle regular chat messages
          setMessages((prev) => [
            ...prev,
            {
              text: response.message || response.text,
              isUser: false,
              type: response.type,
              media: response.media,
              files: response.files,
            },
          ])
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
        console.log('Raw message data:', event.data)
        setIsThinking(false)
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    websocket.onclose = (event) => {
      console.log(
        'WebSocket closed. Code:',
        event.code,
        'Reason:',
        event.reason || 'No reason provided'
      )
    }

    return websocket
  }

  useEffect(() => {
    const websocket = connectWebSocket()
    if (websocket) setWs(websocket)

    return () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, []) // Only run on mount

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !ws) return

    const message = { text: inputMessage, isUser: true }
    setMessages((prev) => [...prev, message])
    setIsThinking(true)
    ws.send(
      JSON.stringify({
        action: 'sendMessage', // Add action for API Gateway routing
        message: inputMessage,
        sessionId,
      })
    )
    setInputMessage('')
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <MainContentContainer>
      <HeaderContainer>
        <AppHeader userAvatarSrc="/user-avatar.jpeg" />
      </HeaderContainer>

      <ContentContainer>
        <ChatFlowContainer>
          <MessagesContainer>
            {messages.map((message, index) => (
              <MessageRow
                key={index}
                sx={{
                  justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                  marginBottom: index === messages.length - 1 ? 0 : 2,
                }}
              >
                {!message.isUser && (
                  <UserAvatar
                    alt="Bot"
                    src="/trackit-user-icon.png"
                    sx={{ mt: 0.5 }}
                  />
                )}

                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <MessageBubble isUser={message.isUser}>
                    <MessageText isUser={message.isUser}>
                      {message.text}
                    </MessageText>
                  </MessageBubble>

                  {message.media && message.media.length > 0 && (
                    <VideoContainer isUser={message.isUser}>
                      {message.media.map((item, mediaIndex) => (
                        <Box key={mediaIndex} sx={{ mt: 1, width: '100%' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 0.5,
                              color: '#666666',
                              textAlign: message.isUser ? 'right' : 'left',
                              fontSize: '13px',
                            }}
                          >
                            {item.title}
                          </Typography>
                          <video
                            controls
                            poster={item.poster}
                            width="100%"
                            style={{
                              borderRadius: '8px',
                              maxHeight: '300px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <source src={item.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </Box>
                      ))}
                    </VideoContainer>
                  )}

                  {message.files && message.files.length > 0 && (
                    <FileContainer isUser={message.isUser}>
                      {message.files.map((file, fileIndex) => (
                        <Box key={fileIndex} sx={{ mt: 1 }}>
                          <FileButtonComponent
                            file={file}
                            isUser={message.isUser}
                          />
                        </Box>
                      ))}
                    </FileContainer>
                  )}
                </Box>

                {message.isUser && (
                  <UserAvatar
                    alt="User"
                    src="/user-avatar.jpeg"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </MessageRow>
            ))}

            {isThinking && (
              <MessageRow>
                <UserAvatar
                  alt="Bot"
                  src="/trackit-user-icon.png"
                  sx={{ mt: 0.5 }}
                />
                <ThinkingBubble>
                  <ThinkingDots>
                    <ThinkingDot delay="0s" />
                    <ThinkingDot delay="0.2s" />
                    <ThinkingDot delay="0.4s" />
                  </ThinkingDots>
                </ThinkingBubble>
              </MessageRow>
            )}

            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputContainer sx={{ margin: (theme) => theme.spacing(0, 2, 2, 2) }}>
            <ChatInput
              fullWidth
              multiline
              maxRows={4}
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInputMessage(e.target.value)
              }
              onKeyPress={handleKeyPress}
              placeholder="Say something to the Gen AI Tool"
              variant="outlined"
              size="small"
              disabled={isThinking}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isThinking}
                      sx={{
                        color: '#2196F3',
                        width: '32px',
                        height: '32px',
                        marginRight: '-4px',
                        '&.Mui-disabled': {
                          color: 'rgba(0, 0, 0, 0.26)',
                        },
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </InputContainer>

          <Footer>
            <Typography
              variant="caption"
              sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              powered by <FooterLink href="#">TrackIt</FooterLink> &{' '}
              <FooterLink href="#">Twelve Labs</FooterLink>
            </Typography>
          </Footer>
        </ChatFlowContainer>

        {/* Log Panel */}
        <LogPanelContainer>
          <LogHeader>Logs</LogHeader>
          <LogContent>
            {logMessages.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: '#999', padding: 2, fontStyle: 'italic' }}
              >
                No logs yet
              </Typography>
            ) : (
              logMessages.map((log, index) => (
                <React.Fragment key={index}>
                  <ApiLogComponent logText={log.text} />
                </React.Fragment>
              ))
            )}
            <div ref={logsEndRef} />
          </LogContent>
        </LogPanelContainer>
      </ContentContainer>
    </MainContentContainer>
  )
}
