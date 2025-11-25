import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona para o dashboard (será para login quando implementarmos auth)
  redirect('/dashboard');
}
