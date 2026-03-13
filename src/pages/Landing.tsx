import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Briefcase, Code, GraduationCap, Star, Globe } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight font-[Space_Grotesk]">LinkDevs<span className="text-secondary">Org</span></span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Who It's For</a>
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
            <Link to="/signup"><Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Join</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
              <Globe className="h-4 w-4" /> Empowering African Tech Talent
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Bridge the Gap Between <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Learning & Working</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Real projects. Real mentors. Real opportunities. LinkDevsOrg connects African graduates with hands-on experience and employers who value proof-of-work over paper credentials.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup?role=graduate">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base px-8">
                <GraduationCap className="mr-2 h-5 w-5" /> Join as Graduate
              </Button>
            </Link>
            <Link to="/signup?role=mentor">
              <Button size="lg" variant="outline" className="text-base px-8">
                <Users className="mr-2 h-5 w-5" /> Become a Mentor
              </Button>
            </Link>
            <Link to="/signup?role=employer">
              <Button size="lg" variant="outline" className="text-base px-8">
                <Briefcase className="mr-2 h-5 w-5" /> Hire Talent
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card py-12">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {[
            { value: '10K+', label: 'Graduates' },
            { value: '500+', label: 'Mentors' },
            { value: '2K+', label: 'Projects Completed' },
            { value: '300+', label: 'Hiring Partners' },
          ].map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className="text-center">
              <p className="text-3xl font-extrabold text-primary md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Three simple steps to launch your tech career</p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { step: '01', icon: GraduationCap, title: 'Sign Up & Build Your Profile', desc: 'Create your profile, showcase your skills, and tell us what you want to learn.' },
              { step: '02', icon: Users, title: 'Get Matched with Mentors', desc: 'Connect with experienced developers who guide you through real-world projects.' },
              { step: '03', icon: Star, title: 'Build Portfolio & Get Hired', desc: 'Complete projects, earn reviews, and let employers discover your proven skills.' },
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-secondary/40 hover:shadow-lg">
                <span className="text-5xl font-extrabold text-muted/60">{item.step}</span>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                  <item.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-primary py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">Built For Everyone in the Ecosystem</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/70">Whether you're learning, teaching, or hiring — LinkDevsOrg has you covered.</p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { icon: GraduationCap, title: 'Graduates', features: ['Work on real projects', 'Get mentored by pros', 'Build a proof-of-work portfolio', 'Get discovered by employers'] },
              { icon: Users, title: 'Mentors', features: ['Guide the next generation', 'Post coding challenges', 'Track student progress', 'Build your reputation'] },
              { icon: Briefcase, title: 'Employers', features: ['Discover vetted talent', 'See real project work', 'Post jobs & internships', 'Bookmark top graduates'] },
            ].map((role, i) => (
              <motion.div key={role.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-8 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                  <role.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-primary-foreground">{role.title}</h3>
                <ul className="mt-4 space-y-2">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                      <ArrowRight className="h-3 w-3 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Start Your Journey?</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Join thousands of African developers building real skills and getting hired.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base px-10">
                Get Started — It's Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Code className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold font-[Space_Grotesk]">LinkDevs<span className="text-secondary">Org</span></span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 LinkDevsOrg. Empowering African tech talent.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
