module.exports = () => {
  const { TOKEN_ADMIN, TOKEN_POS } = process.env
  if (!TOKEN_ADMIN)
    throw new Error(
      'Could not load TOKEN_ADMIN from env. TOKEN_ADMIN is required'
    )
  if (!TOKEN_POS)
    throw new Error('Could not load TOKEN_POS from env. TOKEN_POS is required')
}
