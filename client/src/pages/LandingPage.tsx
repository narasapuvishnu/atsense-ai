import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <main id="main-content" style={{ paddingTop: '70px' }}>
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
};

export default LandingPage;
