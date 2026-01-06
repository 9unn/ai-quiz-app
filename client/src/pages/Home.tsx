import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="container max-w-4xl relative z-10 text-center">
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm text-primary font-semibold text-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4" />
          <span>Discover the Future of Intelligence</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-primary via-purple-600 to-accent animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Unlock Your <br/> AI Potential
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Explore the fascinating world of Artificial Intelligence. Test your knowledge, learn new concepts, and see where you stand in the age of AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link href="/quiz">
            <Button size="lg" className="h-16 px-8 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90">
              Start the Quiz <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-16 px-8 text-lg rounded-2xl border-white/40 bg-white/20 hover:bg-white/40 backdrop-blur-md hover:scale-105 transition-all duration-300">
            Learn More
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: <BrainCircuit className="w-8 h-8 text-primary" />,
              title: "Smart Learning",
              desc: "Interactive questions designed to teach you as you play."
            },
            {
              icon: <Sparkles className="w-8 h-8 text-accent" />,
              title: "Fun & Engaging",
              desc: "No boring lectures. Just fun challenges and instant feedback."
            },
            {
              icon: <ArrowRight className="w-8 h-8 text-secondary-foreground" />,
              title: "For Everyone",
              desc: "Whether you're a newbie or a pro, there's something for you."
            }
          ].map((item, i) => (
            <Card key={i} className="glass-panel border-none hover:bg-white/40 transition-colors duration-300">
              <CardContent className="pt-6">
                <div className="mb-4 p-3 bg-white/50 rounded-xl w-fit shadow-sm">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
