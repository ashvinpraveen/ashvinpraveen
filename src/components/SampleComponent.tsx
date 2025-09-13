import { useState } from 'react';
import { Heart, Github, Mail } from 'lucide-react';

interface SampleComponentProps {
  title?: string;
}

export default function SampleComponent({ title = "Welcome to your site!" }: SampleComponentProps) {
  const [likes, setLikes] = useState(0);

  return (
    <div className="max-w-md mx-auto bg-surface rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-primary mb-4">
          {title}
        </h2>

        <p className="text-muted mb-6">
          This is a sample component built with React, Tailwind CSS, and Lucide icons.
          Everything is set up and ready to go!
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setLikes(likes + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            <Heart className={`w-5 h-5 ${likes > 0 ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>

          <div className="flex gap-3">
            <a
              href="https://github.com"
              className="p-2 text-subtle hover:text-primary transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:hello@example.com"
              className="p-2 text-subtle hover:text-primary transition-colors duration-200"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}