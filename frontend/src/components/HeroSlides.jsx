import { ArrowLeft, ArrowRight, BookOpenText, Code2, GraduationCap, Laptop, Sparkles, Wifi } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import TutorPortrait from './TutorPortrait';

const slides = [
  {
    eyebrow: 'Technology • Education • Success',
    title: 'Meet the tutor who makes it click.',
    description: 'Find trusted one-to-one support, book a time that works, and keep every learning resource in one place.',
    primaryAction: 'Find your tutor',
    primaryHref: '/tutors',
    secondaryAction: 'Explore subjects',
    secondaryHref: '/tutors',
    feature: 'A great match for every goal',
    names: ['Amelia Hart', 'Marcus Lee', 'Priya Nair'],
    metric: '1:1',
    metricLabel: 'personal tutor support',
    accent: 'blue'
  },
  {
    eyebrow: 'Teach what you love',
    title: 'Share what you know. Change what comes next.',
    description: 'Build your tutor profile, meet motivated learners, manage sessions, and share materials that help students grow.',
    primaryAction: 'Become a tutor',
    primaryHref: '/register?role=TUTOR',
    secondaryAction: 'See how it works',
    secondaryHref: '/#how-it-works',
    feature: 'Teaching that moves learners forward',
    names: ['Ethan Brooks', 'Aisha Morgan', 'Daniel Kim'],
    metric: '1:1',
    metricLabel: 'learning support',
    accent: 'gold'
  }
];

export default function HeroSlides() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];

  const changeSlide = (direction) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section className="px-4 py-10 sm:py-14 lg:py-20" aria-label="TechieTutor highlights">
      <div className={`hero-slide hero-slide-${slide.accent} relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xl lg:grid-cols-[1.04fr_0.96fr]`}>
        <div className="hero-slide-copy relative z-10 flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <span className="eyebrow w-fit"><Sparkles size={14} /> {slide.eyebrow}</span>
          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {activeSlide === 0 ? (
              <>Learn.<br /><span className="hero-3d hero-highlight">Create.</span><br /><span className="hero-3d">Succeed.</span></>
            ) : slide.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{slide.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={slide.primaryHref} className="btn btn-primary">
              {slide.primaryAction}<ArrowRight size={16} />
            </Link>
            <Link to={slide.secondaryHref} className="btn btn-secondary">{slide.secondaryAction}</Link>
          </div>

          <div className="mt-9 flex items-center gap-3 border-t border-slate-200 pt-6">
            <div className="flex -space-x-3">
              {slide.names.map((name, index) => (
                <TutorPortrait
                  key={name}
                  id={activeSlide * 3 + index + 1}
                  name={name}
                  className="h-11 w-11 rounded-full border-[3px] border-white shadow-sm"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900"><BookOpenText size={15} className="text-blue-600" /> {slide.feature}</div>
              <p className="mt-1 text-xs text-slate-500">Thoughtful teaching, built around you.</p>
            </div>
          </div>
        </div>

        <div className="hero-slide-art relative flex min-h-[330px] items-center justify-center overflow-hidden p-8 sm:min-h-[440px]">
          <div className="absolute inset-0 opacity-50" aria-hidden="true">
            <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl" />
          </div>

          <div className="hero-portrait-grid relative grid w-full max-w-[27rem] grid-cols-2 items-center gap-4 sm:gap-5">
            <div className="hero-floating-card hero-floating-card-top"><Laptop size={18} /><span>Learn online</span></div>
            <TutorPortrait
              id={activeSlide * 4 + 1}
              name={slide.names[0]}
              className="hero-portrait-primary aspect-square w-full -rotate-3 rounded-[2rem] border-4 border-white shadow-2xl"
            />
            <div className="grid gap-4 sm:gap-5">
              <TutorPortrait
                id={activeSlide * 4 + 2}
                name={slide.names[1]}
                className="hero-portrait-secondary aspect-square w-4/5 justify-self-end rotate-3 rounded-[1.7rem] border-4 border-white shadow-xl"
              />
              <TutorPortrait
                id={activeSlide * 4 + 3}
                name={slide.names[2]}
                className="hero-portrait-tertiary aspect-square w-4/5 rounded-[1.7rem] border-4 border-white shadow-xl"
              />
            </div>
            <div className="hero-floating-card hero-floating-card-bottom"><Code2 size={17} /><span>Skills for tomorrow</span></div>
          </div>

          <div className="absolute bottom-6 left-5 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:bottom-8 sm:left-8">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><GraduationCap size={21} /></div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">{slide.metric}</div>
              <div className="text-xs font-medium text-slate-500">{slide.metricLabel}</div>
            </div>
          </div>
          <div className="hero-wifi-badge" aria-hidden="true"><Wifi size={18} /></div>

          <div className="absolute right-5 top-5 flex items-center gap-2 sm:right-8 sm:top-8">
            <button
              type="button"
              className="slide-control"
              aria-label="Previous feature slide"
              onClick={() => changeSlide(-1)}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              className="slide-control"
              aria-label="Next feature slide"
              onClick={() => changeSlide(1)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 right-5 z-10 flex gap-2 lg:bottom-6 lg:right-[calc(50%+1.5rem)]" aria-label="Choose highlight slide">
          {slides.map((item, index) => (
            <button
              key={item.eyebrow}
              type="button"
              className={`slide-dot ${activeSlide === index ? 'slide-dot-active' : ''}`}
              aria-label={`Show slide ${index + 1}`}
              aria-current={activeSlide === index ? 'true' : undefined}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
