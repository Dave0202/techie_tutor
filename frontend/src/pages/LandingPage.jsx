import { BookOpenText, Clock3, GraduationCap, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSlides from '../components/HeroSlides';
import TutorPortrait from '../components/TutorPortrait';

const features = [
  { icon: Search, title: 'Expert tutors', text: 'Explore tutor profiles, compare subjects and rates, and find support that fits your goals.' },
  { icon: Clock3, title: 'Flexible learning', text: 'Find session times that fit around school, work, and the rest of your week.' },
  { icon: BookOpenText, title: 'Interactive learning', text: 'Access tutor-shared resources and continue learning beyond each session.' },
  { icon: ShieldCheck, title: 'Track your progress', text: 'Manage session requests and stay on top of your upcoming learning.' },
];

const subjects = ['Mathematics', 'Python Programming', 'Scratch Programming', 'Graphics Design', 'Creative Writing', 'AI & Technology', 'ICT', 'SATS Preparation'];
const tutorPortraits = [
  { name: 'Amelia Hart', subject: 'Mathematics' },
  { name: 'Marcus Lee', subject: 'Physics' },
  { name: 'Priya Nair', subject: 'Computer science' },
  { name: 'Ethan Brooks', subject: 'English' },
  { name: 'Aisha Morgan', subject: 'Biology' },
  { name: 'Daniel Kim', subject: 'Chemistry' },
  { name: 'Sofia Rivera', subject: 'Statistics' },
  { name: 'Noah Williams', subject: 'Study skills' }
];

export default function LandingPage() {
  return (
    <>
      <HeroSlides />

      <section className="px-4 pb-10 sm:pb-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">A welcoming tutor community</span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Meet tutors ready to help you grow.</h2>
            </div>
            <Link to="/tutors" className="text-link">Browse all tutors</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {tutorPortraits.map(({ name, subject }, index) => (
              <Link
                to="/tutors"
                key={name}
                className="tutor-gallery-card group rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <TutorPortrait
                  id={index + 1}
                  name={name}
                  className="tutor-gallery-portrait aspect-square w-full rounded-xl transition group-hover:scale-[1.025]"
                />
                <span className="mt-2 block truncate text-xs font-bold text-slate-800">{name}</span>
                <span className="mt-0.5 block truncate text-[11px] text-slate-500">{subject}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Why students choose us</span>
            <h2>Learning that helps you move forward.</h2>
            <p>Expert support, flexible sessions, and useful resources come together in one place.</p>
          </div>
          <div className="grid-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="feature-card">
                <div className="icon-box"><Icon size={20} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section" style={{ background: 'rgba(255,255,255,0.4)' }}>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">How it works</span>
            <h2>Simple steps, better outcomes.</h2>
          </div>
          <div className="grid-3">
            {['Create your account', 'Browse and match with tutors', 'Book sessions and access materials'].map((step, idx) => (
              <div key={step} className="feature-card">
                <div className="icon-box" style={{ width: 36, height: 36, borderRadius: 12 }}>{idx + 1}</div>
                <h3>{step}</h3>
                <p>Designed for an effortless flow from first search to final session milestone.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Popular subjects</span>
            <h2>Explore a new subject or build on what you know.</h2>
          </div>
          <div className="subject-grid">
            {subjects.map((subject) => (
              <div key={subject} className="subject-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="icon-box"><GraduationCap size={18} /></div>
                  <Sparkles size={16} className="subject-sparkle" aria-hidden="true" />
                </div>
                <h3>{subject}</h3>
                <p>Find focused support and practical resources for your learning goals.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Your next step</span>
            <h2>Make room for a brighter kind of learning.</h2>
          </div>
          <div className="grid-3">
            {[
              { title: 'Learn with confidence', text: 'Get one-to-one help tailored to the way you learn.' },
              { title: 'Build practical skills', text: 'Explore academic and technology subjects with experienced tutors.' },
              { title: 'Keep your progress close', text: 'Manage bookings and useful learning resources in one place.' },
            ].map((item) => (
              <div key={item.title} className="feature-card outcome-card">
                <div className="gold-rule" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
