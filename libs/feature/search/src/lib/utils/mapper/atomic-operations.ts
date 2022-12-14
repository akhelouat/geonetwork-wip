import { MetadataContact, MetadataLink } from '@geonetwork-ui/util/shared'

export type SourceWithUnknownProps = { [key: string]: unknown }

export const selectField = <T>(
  source: SourceWithUnknownProps,
  fieldName: string
): T | null =>
  source !== null && fieldName in source ? (source[fieldName] as T) : null

export const selectFallbackFields = <T>(
  source: SourceWithUnknownProps,
  ...fieldNames: string[]
): T | null =>
  fieldNames.reduce<T>(
    (prev, curr) => (prev === null ? selectField(source, curr) : prev),
    null
  )

export const selectFallback = <T, U>(field: T, fallback: U): T | U =>
  field === null ? fallback : field

export const selectTranslatedValue = <T>(
  source: SourceWithUnknownProps
): T | null => selectField(source, 'default')

export const selectTranslatedField = <T>(
  source: SourceWithUnknownProps,
  fieldName: string
): T | null => selectTranslatedValue(selectField(source, fieldName))

export const toDate = (field) => new Date(field)

export const getFirstValue = (field) =>
  Array.isArray(field) ? field[0] : field

export const getAsArray = (field) =>
  Array.isArray(field) ? field : field !== null ? [field] : []

export const getAsUrl = (field) => {
  // an empty string is not a valid url, even though it could be considered an empty path to the root
  if (field === '' || field === null) return null
  try {
    return new URL(field, window.location.toString()).toString()
  } catch {
    return null
  }
}

export const mapLink = (sourceLink: SourceWithUnknownProps): MetadataLink => {
  const url = getAsUrl(selectField<string>(sourceLink, 'url'))
  // no url: fail early
  if (url === null) {
    return { invalid: true, reason: 'The link does not contain a valid URL' }
  }

  const protocolMatch = /^(https?|ftp):/.test(url)
  if (!protocolMatch) {
    return {
      invalid: true,
      reason:
        'The URL for the link is in an unsupported protocol; supported protocols are HTTP, HTTPS and FTP',
    }
  }

  const sourceName = selectField<string>(sourceLink, 'name')
  const sourceNameEmpty = sourceName === null || sourceName === ''
  const filenameRegex = /\/?([^/]+)$/
  const name =
    sourceNameEmpty && filenameRegex.test(url)
      ? url.match(filenameRegex)[1]
      : sourceName
  const description = selectField<string>(sourceLink, 'description')
  const label = description || name
  const protocol = selectField<string>(sourceLink, 'protocol')
  return {
    url,
    ...(name !== null && { name }),
    ...(description !== null && { description }),
    ...(label !== null && { label }),
    ...(protocol !== null && { protocol }),
  }
}

export const mapContact = (
  sourceContact: SourceWithUnknownProps,
  sourceRecord: SourceWithUnknownProps
): MetadataContact => {
  const website = getAsUrl(selectField<string>(sourceContact, 'website'))
  const logoUrl = getAsUrl(`/geonetwork${selectField(sourceRecord, 'logo')}`)
  const address = selectField<string>(sourceContact, 'address')
  const phone = selectField<string>(sourceContact, 'phone')
  return {
    name: selectField<string>(sourceContact, 'individual'),
    organisation: selectField<string>(sourceContact, 'organisation'),
    email: selectField<string>(sourceContact, 'email'),
    ...(website !== null && { website }),
    ...(logoUrl !== null && { logoUrl }),
    ...(address !== null && { address }),
    ...(phone !== null && { phone }),
  }
}
