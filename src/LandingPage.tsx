import { Button, Card } from "@radix-ui/themes";
import { Download, Image, Palette, Smartphone, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import Header from "./components/Header";
const Landing = () => {
  return (
    <div className="max-w-full mx-auto">
      <Header />
      <div className="max-h-screen  bg-gradient-to-br overflow-scroll from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className=" mx-auto">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 py-6">
              Create Stunning Play Store Screenshots
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your app screenshots into professional marketing
              materials with device frames, custom text overlays, and beautiful
              compositions. No design skills required.
            </p>

            <div className="flex justify-center space-x-4 mb-12">
              <Link to="/dashboard">
                <Button
                  size="3"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Start Creating For Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="3">
                  View Pricing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Preview Image */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="w-32 h-56 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mx-auto border-8 border-gray-800 flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">iPhone Frame</p>
                  </div>
                  <div className="space-y-4">
                    <div className="w-32 h-56 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl mx-auto border-8 border-gray-800 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">Android Frame</p>
                  </div>
                  <div className="space-y-4">
                    <div className="w-32 h-56 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mx-auto border-8 border-gray-800 flex items-center justify-center">
                      <Palette className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">Custom Design</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything you need to create amazing visuals
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional tools designed specifically for app developers and
                marketers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Device Frames</h3>
                  <p className="text-gray-600">
                    Choose from iPhone, Android, iPad, and laptop frames. All
                    updated with the latest device designs.
                  </p>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Palette className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Custom Text & Design
                  </h3>
                  <p className="text-gray-600">
                    Add compelling headlines, feature highlights, and
                    call-to-actions with full typography control.
                  </p>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Bulk Export</h3>
                  <p className="text-gray-600">
                    Export individual images or download everything as a ZIP
                    file. Multiple formats supported.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to create stunning app screenshots?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust DeviceArt Studio for their
              app marketing visuals.
            </p>

            <div className="flex justify-center space-x-4">
              <Link to="/dashboard">
                <Button
                  size="3"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="3">
                  See Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;
