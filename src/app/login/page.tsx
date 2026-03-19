import LoginForm from './LoginForm'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  return <LoginForm message={searchParams?.message} />
}