import Image from 'next/image';

export default function LogoPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 p-8">
      <Image
        src="/logo.png"
        alt="LeetLockin logo"
        width={256}
        height={256}
        priority
        className="rounded-2xl"
      />
      <p className="text-2xl font-semibold tracking-tight text-neutral-900">
        leetlockin.com
      </p>
    </main>
  );
}
