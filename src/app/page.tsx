import Link from 'next/link';
import { BookOpen, PlusCircle, Languages } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-source via-primary to-target" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-target/5 rounded-full blur-3xl" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-3xl mb-8 border border-primary/20">
          <Languages size={56} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-7xl mb-4">
          BILA
        </h1>
        <p className="max-w-md mx-auto text-xl text-muted-foreground font-medium leading-relaxed">
          Master new languages with our <span className="text-source font-bold italic">Interlinear</span> reading experience.
        </p>
      </div>

      <div className="relative z-10 mt-16 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="grid gap-6">
          <Link
            href="/library"
            className="premium-card flex items-center gap-6 p-8 group"
          >
            <div className="p-4 bg-source/10 text-source rounded-2xl group-hover:bg-source group-hover:text-white transition-all duration-300">
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black group-hover:text-source transition-colors">Library</h2>
              <p className="text-muted-foreground font-medium mt-1">Read your collection of bilingual stories.</p>
            </div>
          </Link>

          <Link
            href="/editor"
            className="premium-card flex items-center gap-6 p-8 group"
          >
            <div className="p-4 bg-target/10 text-target rounded-2xl group-hover:bg-target group-hover:text-white transition-all duration-300">
              <PlusCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black group-hover:text-target transition-colors">Editor</h2>
              <p className="text-muted-foreground font-medium mt-1">Create, review, and update interlinear lessons.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
