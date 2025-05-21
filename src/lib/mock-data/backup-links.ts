
export interface BackupLink {
  id: string;
  url: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
}

class BackupLinksService {
  private links: BackupLink[] = [];
  private storageKey = 'backup_links';

  constructor() {
    this.loadLinks();
  }

  private loadLinks() {
    const storedLinks = localStorage.getItem(this.storageKey);
    if (storedLinks) {
      try {
        this.links = JSON.parse(storedLinks);
      } catch (error) {
        console.error('Error parsing stored backup links:', error);
        this.links = [];
      }
    }
  }

  private saveLinks() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.links));
  }

  async getLinks(): Promise<{ data: BackupLink[] | null; error: any }> {
    return { data: [...this.links], error: null };
  }

  async addLink(link: Omit<BackupLink, 'id' | 'created_at'>): Promise<{ data: BackupLink | null; error: any }> {
    const newLink: BackupLink = {
      ...link,
      id: `link_${Date.now().toString(36)}`,
      created_at: new Date().toISOString()
    };
    
    this.links.push(newLink);
    this.saveLinks();
    
    return { data: newLink, error: null };
  }

  async updateLink(id: string, updates: Partial<BackupLink>): Promise<{ data: BackupLink | null; error: any }> {
    const linkIndex = this.links.findIndex(link => link.id === id);
    
    if (linkIndex === -1) {
      return { data: null, error: 'Link not found' };
    }
    
    this.links[linkIndex] = {
      ...this.links[linkIndex],
      ...updates
    };
    
    this.saveLinks();
    
    return { data: this.links[linkIndex], error: null };
  }

  async deleteLink(id: string): Promise<{ error: any }> {
    const initialLength = this.links.length;
    this.links = this.links.filter(link => link.id !== id);
    
    if (this.links.length === initialLength) {
      return { error: 'Link not found' };
    }
    
    this.saveLinks();
    
    return { error: null };
  }
}

const backupLinksService = new BackupLinksService();
export default backupLinksService;
