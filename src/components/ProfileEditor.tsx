import { useState, useEffect } from 'react';
import EditableContent from './EditableContent';
import RichTextEditor from './RichTextEditor';

interface ProfileData {
  bio?: string;
  title?: string;
  projects?: Array<{id: string, title: string, description: string, url?: string}>;
  socialLinks?: Array<{id: string, platform: string, url: string}>;
}

interface ProfileEditorProps {
  initialData: ProfileData;
  isOwner: boolean;
  onSave: (data: ProfileData) => void;
}

export default function ProfileEditor({ initialData, isOwner, onSave }: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(initialData);

  useEffect(() => {
    setProfileData(initialData);
  }, [initialData]);

  const handleSave = (field: keyof ProfileData, value: any) => {
    const newData = { ...profileData, [field]: value };
    setProfileData(newData);
    onSave(newData);
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      title: '',
      description: '',
      url: ''
    };
    const newProjects = [...(profileData.projects || []), newProject];
    handleSave('projects', newProjects);
  };

  const updateProject = (id: string, updates: Partial<typeof profileData.projects[0]>) => {
    const newProjects = (profileData.projects || []).map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    handleSave('projects', newProjects);
  };

  const deleteProject = (id: string) => {
    const newProjects = (profileData.projects || []).filter(p => p.id !== id);
    handleSave('projects', newProjects);
  };

  return (
    <div className="profile-editor">
      {isOwner && (
        <div className="edit-controls">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`edit-toggle ${isEditing ? 'active' : ''}`}
          >
            {isEditing ? '✓ Save & Exit Edit Mode' : '✏️ Edit Profile'}
          </button>
        </div>
      )}

      <div className="profile-content">
        <section className="profile-header">
          <EditableContent
            content={profileData.title || ''}
            onSave={(value) => handleSave('title', value)}
            isEditing={isEditing}
            placeholder="Your name or title"
            element="h1"
            className="profile-title"
          />

          <RichTextEditor
            content={profileData.bio || ''}
            onSave={(value) => handleSave('bio', value)}
            isEditing={isEditing}
            placeholder="Tell us about yourself... You can use rich text formatting!"
            className="profile-bio"
          />
        </section>

        <section className="projects-section">
          <h2>Projects</h2>
          {(profileData.projects || []).map(project => (
            <div key={project.id} className="project-card">
              <EditableContent
                content={project.title}
                onSave={(value) => updateProject(project.id, { title: value })}
                isEditing={isEditing}
                placeholder="Project title"
                element="h3"
                className="project-title"
              />
              <EditableContent
                content={project.description}
                onSave={(value) => updateProject(project.id, { description: value })}
                isEditing={isEditing}
                placeholder="Project description"
                element="p"
                className="project-description"
              />
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  View Project →
                </a>
              )}
              {isEditing && (
                <button
                  onClick={() => deleteProject(project.id)}
                  className="delete-project"
                >
                  Delete
                </button>
              )}
            </div>
          ))}

          {isEditing && (
            <button onClick={addProject} className="add-project">
              + Add Project
            </button>
          )}
        </section>
      </div>
    </div>
  );
}