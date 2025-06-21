'use client';

export default function FitbodDemo() {
  return (
    <div className="fitbod-background min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold fitbod-text-primary mb-2">
            FitForge Design System
          </h1>
          <p className="fitbod-text-secondary">
            Precise Fitbod-extracted design tokens from ChatGPT image analysis
          </p>
        </div>

        {/* Color Palette Demo */}
        <div className="fitbod-card">
          <h2 className="text-2xl font-semibold fitbod-text-primary mb-6">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl mx-auto mb-2" style={{backgroundColor: '#121212'}}></div>
              <p className="fitbod-text-primary text-sm font-medium">Background</p>
              <p className="fitbod-text-secondary text-xs">#121212</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl mx-auto mb-2" style={{backgroundColor: '#1C1C1E'}}></div>
              <p className="fitbod-text-primary text-sm font-medium">Card</p>
              <p className="fitbod-text-secondary text-xs">#1C1C1E</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl mx-auto mb-2" style={{backgroundColor: '#2C2C2E'}}></div>
              <p className="fitbod-text-primary text-sm font-medium">Subtle</p>
              <p className="fitbod-text-secondary text-xs">#2C2C2E</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl mx-auto mb-2" style={{backgroundColor: '#FF375F'}}></div>
              <p className="fitbod-text-primary text-sm font-medium">Accent</p>
              <p className="fitbod-text-secondary text-xs">#FF375F</p>
            </div>
          </div>
        </div>

        {/* Typography Demo */}
        <div className="fitbod-card">
          <h2 className="text-2xl font-semibold fitbod-text-primary mb-6">
            Typography Scale
          </h2>
          <div className="space-y-4">
            <div>
              <p className="fitbod-text-secondary text-sm mb-1">16px/24px - Base Text</p>
              <p className="fitbod-text-primary text-fitbod-base">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div>
              <p className="fitbod-text-secondary text-sm mb-1">14px/20px - Small Text</p>
              <p className="fitbod-text-primary text-fitbod-sm">
                Secondary information and metadata
              </p>
            </div>
            <div>
              <p className="fitbod-text-secondary text-sm mb-1">12px/18px - Caption</p>
              <p className="fitbod-text-primary text-fitbod-xs">
                Labels and micro-content
              </p>
            </div>
          </div>
        </div>

        {/* Components Demo */}
        <div className="fitbod-card">
          <h2 className="text-2xl font-semibold fitbod-text-primary mb-6">
            Component Examples
          </h2>
          <div className="space-y-6">
            
            {/* Buttons */}
            <div>
              <h3 className="fitbod-text-primary font-medium mb-3">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="fitbod-button-primary">
                  Primary Action
                </button>
                <button className="bg-fitbod-subtle fitbod-text-primary px-6 py-3 rounded-xl font-medium hover:bg-[#3C3C3E] transition-all duration-200">
                  Secondary Action
                </button>
              </div>
            </div>

            {/* Exercise Card Example */}
            <div>
              <h3 className="fitbod-text-primary font-medium mb-3">Exercise Card</h3>
              <div className="bg-fitbod-card rounded-xl p-6 hover:bg-fitbod-subtle transition-all duration-200 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="fitbod-text-primary font-semibold text-lg">Bench Press</h4>
                  <span className="bg-fitbod-accent px-2 py-1 rounded-md text-white text-xs font-medium">
                    85%
                  </span>
                </div>
                <p className="fitbod-text-secondary text-sm mb-3">
                  Chest, Shoulders, Triceps
                </p>
                <div className="flex justify-between items-center">
                  <span className="fitbod-text-secondary text-sm">Last: 135 lbs × 10</span>
                  <span className="fitbod-text-primary text-sm font-medium">3 sets</span>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div>
              <h3 className="fitbod-text-primary font-medium mb-3">Input Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="fitbod-text-secondary text-sm block mb-2">Weight (lbs)</label>
                  <input 
                    type="number" 
                    placeholder="135"
                    className="fitbod-input w-full text-center text-xl font-bold"
                  />
                </div>
                <div>
                  <label className="fitbod-text-secondary text-sm block mb-2">Reps</label>
                  <input 
                    type="number" 
                    placeholder="10"
                    className="fitbod-input w-full text-center text-xl font-bold"
                  />
                </div>
                <div>
                  <label className="fitbod-text-secondary text-sm block mb-2">Sets</label>
                  <input 
                    type="number" 
                    placeholder="3"
                    className="fitbod-input w-full text-center text-xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Spacing Demo */}
            <div>
              <h3 className="fitbod-text-primary font-medium mb-3">Spacing System</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-fitbod-accent rounded"></div>
                  <span className="fitbod-text-secondary text-sm">12px - Tight spacing</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-fitbod-accent rounded"></div>
                  <span className="fitbod-text-secondary text-sm">16px - Standard padding</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-6 h-6 bg-fitbod-accent rounded"></div>
                  <span className="fitbod-text-secondary text-sm">24px - Section spacing</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Methodology Note */}
        <div className="fitbod-card border-l-4 border-fitbod-accent">
          <h3 className="fitbod-text-primary font-semibold mb-2">
            🎯 Extraction Methodology
          </h3>
          <p className="fitbod-text-secondary text-sm leading-relaxed">
            These design tokens were extracted using <strong className="fitbod-text-primary">ChatGPT's image analysis</strong> of 
            the actual Fitbod iOS app screenshots. This approach provided precise hex codes (#FF375F), 
            exact spacing values (12px, 16px, 24px), and specific typography measurements (16px/24px) 
            that our previous browser-based approximations couldn't achieve.
          </p>
        </div>

      </div>
    </div>
  );
}