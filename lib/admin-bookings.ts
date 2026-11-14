export function isBookingArchived(endAt: string, now: number) {
  return new Date(endAt).getTime() < now
}

export function matchesBookingId(id: string, search: string) {
  return id.toLowerCase().includes(search.trim().toLowerCase())
}
