import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Loader2, GraduationCap, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Role = 'graduate' | 'mentor' | 'employer';

const roleConfig = {
  graduate: { icon: GraduationCap, label: 'Graduate', color: 'bg-accent' },
  mentor: { icon: Users, label: 'Mentor', color: 'bg-secondary' },
  employer: { icon: Briefcase, label: 'Employer', color: 'bg-primary' },
};

const countries = ['Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Egypt', 'Rwanda', 'Ethiopia', 'Tanzania', 'Uganda', 'Cameroon', 'Other'];
const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
const techAreas = ['Frontend', 'Backend', 'Full-Stack', 'Mobile', 'Data Science', 'DevOps', 'UI/UX', 'Cybersecurity'];

export default function Signup() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>((searchParams.get('role') as Role) || 'graduate');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');

  // Graduate fields
  const [areaOfInterest, setAreaOfInterest] = useState('');
  const [languages, setLanguages] = useState('');
  const [skillLevel, setSkillLevel] = useState('');

  // Mentor fields
  const [yearsExp, setYearsExp] = useState('');
  const [techSpecializations, setTechSpecializations] = useState('');

  // Employer fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });

    if (authError) {
      toast({ title: 'Signup failed', description: authError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    // Insert profile
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: name,
      country,
      linkedin_url: linkedin || null,
      github_url: github || null,
    });

    // Insert role
    await supabase.from('user_roles').insert({ user_id: userId, role });

    // Insert role-specific profile
    if (role === 'graduate') {
      await supabase.from('graduate_profiles').insert({
        user_id: userId,
        area_of_interest: areaOfInterest,
        programming_languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
        skill_level: skillLevel,
      });
    } else if (role === 'mentor') {
      await supabase.from('mentor_profiles').insert({
        user_id: userId,
        years_of_experience: parseInt(yearsExp) || 0,
        specializations: techSpecializations.split(',').map((t) => t.trim()).filter(Boolean),
      });
    } else {
      await supabase.from('employer_profiles').insert({
        user_id: userId,
        company_name: companyName,
        industry,
        company_website: companyWebsite || null,
      });
    }

    setLoading(false);
    toast({ title: 'Account created!', description: 'Check your email to verify your account.' });
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-[Space_Grotesk]">LinkDevs<span className="text-secondary">Org</span></span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Step {step} of 2 — {step === 1 ? 'Choose your role' : 'Complete your profile'}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(roleConfig) as Role[]).map((r) => {
                    const cfg = roleConfig[r];
                    return (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${role === r ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/40'}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.color}/10`}>
                          <cfg.icon className={`h-5 w-5 ${role === r ? 'text-secondary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`text-sm font-medium ${role === r ? 'text-secondary' : 'text-muted-foreground'}`}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={() => { if (name && email && password && country) setStep(2); }}
                  disabled={!name || !email || !password || !country}>
                  Continue
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>LinkedIn (optional)</Label>
                    <Input placeholder="linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub (optional)</Label>
                    <Input placeholder="github.com/..." value={github} onChange={(e) => setGithub(e.target.value)} />
                  </div>
                </div>

                {role === 'graduate' && (
                  <>
                    <div className="space-y-2">
                      <Label>Area of Interest</Label>
                      <Select value={areaOfInterest} onValueChange={setAreaOfInterest}>
                        <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                        <SelectContent>
                          {techAreas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Programming Languages</Label>
                      <Input placeholder="JavaScript, Python, TypeScript..." value={languages} onChange={(e) => setLanguages(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Skill Level</Label>
                      <Select value={skillLevel} onValueChange={setSkillLevel}>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          {skillLevels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {role === 'mentor' && (
                  <>
                    <div className="space-y-2">
                      <Label>Years of Experience</Label>
                      <Input type="number" min="1" placeholder="e.g. 5" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tech Specializations</Label>
                      <Input placeholder="React, Node.js, Python..." value={techSpecializations} onChange={(e) => setTechSpecializations(e.target.value)} />
                    </div>
                  </>
                )}

                {role === 'employer' && (
                  <>
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input placeholder="Your company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input placeholder="e.g. FinTech, EdTech..." value={industry} onChange={(e) => setIndustry(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Website (optional)</Label>
                      <Input placeholder="https://..." value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button type="submit" className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                  </Button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-secondary hover:underline">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
