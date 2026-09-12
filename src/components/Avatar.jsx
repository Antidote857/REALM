function Avatar({
  profile,
  className = '',
}) {
  const name =
    profile?.displayName ||
    profile?.username ||
    'REALM'

  const initials = name
    .charAt(0)
    .toUpperCase()

  if (profile?.avatar) {
    return (
      <div className={`realm-avatar ${className}`}>
        <img
          src={profile.avatar}
          alt={name}
        />
      </div>
    )
  }

  return (
    <div className={`realm-avatar ${className}`}>
      {initials}
    </div>
  )
}

export default Avatar