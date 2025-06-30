/** @type {import('next').NextConfig} */
const nextConfig = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@next/next/no-img-element': 'off',
    'react-hooks/exhaustive-deps': 'warn'
  }
}

module.exports = nextConfig