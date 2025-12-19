import BackgroundEffects from "@/components/BackgroundEffects";
import TerminalOverlay from "@/components/TerminalOverlay";
import AIVisualDisplay from "@/components/AIVisualDisplay";
import StatsCard from "@/components/StatsCard";
import CyberButton from "@/components/CyberButton";
import UserPrograms from "@/components/UserPrograms";
import { 
  ArrowRight, 
  Zap, 
  Clock, 
  Target,
  Sparkles 
} from "lucide-react";

const HomePage = () => {
  return (
    <div className="relative flex flex-col min-h-screen text-white overflow-hidden">
      {/* Background Effects */}
      <BackgroundEffects />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 sm:pt-5 lg:pt-5 pb-16 sm:pb-24 flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 relative order-2 lg:order-1">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-silver-900/50 border border-silver-700/50 backdrop-blur-sm glow-silver-sm">
                <Sparkles className="w-4 h-4 text-silver-light" />
                <span className="text-xs sm:text-sm font-mono text-silver-300 tracking-wide">
                  AI-POWERED FITNESS
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                  <span className="block text-white">Shape </span>
                  <span className="block text-chrome">
                    Your Future 
                  </span>
                  <span className="block text-silver-200">with AI-Powered </span>
                  <span className="block">
                    <span className="text-white">Ariven </span>
                    <span className="text-silver-shine"> Wellness</span>
                  </span>
                </h1>
              </div>

              {/* Separator */}
              <div className="relative h-px w-full max-w-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-silver-400/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg lg:text-xl text-silver-400 max-w-xl leading-relaxed">
                Talk to our 
                <span className="text-silver-light font-medium"> AI assistant </span> 
                and get 
                <span className="text-white font-medium"> personalized diet plans </span> 
                and 
                <span className="text-white font-medium"> workout routines </span> 
                designed just for you.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-4">
                <StatsCard 
                  value="500+"
                  label="Active Users"
                  icon={<Zap className="w-4 h-4" />}
                />
                <StatsCard 
                  value="3min"
                  label="Generation"
                  icon={<Clock className="w-4 h-4" />}
                />
                <StatsCard 
                  value="100%"
                  label="Personalized"
                  icon={<Target className="w-4 h-4" />}
                />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <CyberButton 
                  href="/generate-program" 
                  variant="primary" 
                  size="lg"
                >
                  Build Your Program
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </CyberButton>
                
                {/* <CyberButton 
                  href="/learn-more" 
                  variant="outline" 
                  size="lg"
                >
                  Learn More
                </CyberButton> */}
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-4 pt-4 text-silver-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-silver-600 to-silver-700 border-2 border-silver-800 flex items-center justify-center text-xs font-mono text-silver-200"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-mono">
                  <span className="text-silver-300">500+</span> users already transforming
                </span>
              </div>
            </div>

            {/* Right Content - AI Visual */}
            <div className="lg:col-span-5 relative order-1 lg:order-2">
              <div className="relative max-w-md mx-auto lg:max-w-none">
                <AIVisualDisplay imageSrc="/hero-ai3.png" />
                <TerminalOverlay />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative line */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-silver-700 to-transparent" />
      </div>

      {/* User Programs Section */}
      <section className="relative z-10">
        <UserPrograms />
      </section>
    </div>
  );
};

export default HomePage;