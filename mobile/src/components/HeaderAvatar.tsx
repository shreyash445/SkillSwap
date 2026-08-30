import { useRouter } from 'expo-router'
import { Pressable } from 'react-native'
import { Avatar } from '@/components/ui'
import { MY_PROFILE } from '@/data/mock'

export default function HeaderAvatar() {
  const router = useRouter()

  return (
    <Pressable onPress={() => router.push('/profile')} hitSlop={12}>
      <Avatar initials={MY_PROFILE.initials} gradient={MY_PROFILE.gradient} size={32} />
    </Pressable>
  )
}
