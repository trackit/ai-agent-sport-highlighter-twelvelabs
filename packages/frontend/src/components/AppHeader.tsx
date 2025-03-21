import React from 'react'
import {
  Box,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Theme,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { styled } from '@mui/material/styles'

const Header = styled(AppBar)(({ theme }: { theme: Theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: 'none',
  borderBottom: '1px solid #EEEEEE',
  position: 'relative',
  height: '64px',
}))

const Logo = styled(Box)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: '#000000',
}))

const LogoIcon = styled('img')({
  height: '32px',
})

const UserAvatar = styled(Avatar)(({ theme }: { theme: Theme }) => ({
  width: 48,
  height: 48,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  flexShrink: 0,
}))

interface HeaderProps {
  userAvatarSrc: string;
}

export function AppHeader({ userAvatarSrc }: HeaderProps) {
  return (
    <Header position="static">
      <Toolbar sx={{ minHeight: '64px', px: 2 }}>
        <Logo>
          <LogoIcon src="/trackit-logo.png" alt="TrackIt" />
        </Logo>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton color="inherit" sx={{ color: '#666666' }}>
          <NotificationsIcon />
        </IconButton>
        <IconButton color="inherit" sx={{ color: '#666666' }}>
          <SettingsIcon />
        </IconButton>
        <UserAvatar alt="User" src={userAvatarSrc} sx={{ ml: 1 }} />
      </Toolbar>
    </Header>
  )
} 