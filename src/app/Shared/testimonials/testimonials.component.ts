import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialsService, Testimonial, Page } from '../../Services/testimonials.service';
import { UserService } from '../../Services/user.service';

type Role = 'candidate' | 'employer' | 'admin' | null;

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent {
  private testimonialsSvc = inject(TestimonialsService);
  private userSvc = inject(UserService);

  role = signal<Role>(this.userSvc.getUserRole());

  // PUBLIC (approved)
  publicPage = signal<Page<Testimonial> | null>(null);
  pubPageIndex = signal(0);
  pageSize = 6;
  loadingPublic = signal<boolean>(false);

  // MINE
  myTestimonial = signal<Testimonial | null>(null);

  // ADMIN paging/filter
  adminPage = signal<Page<Testimonial> | null>(null);
  adminPageIndex = signal(0);
  adminPageSize = 10;
  adminFilter: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined = undefined;
  loadingAdmin = signal<boolean>(false);

  // UI state
  showForm = signal<boolean>(false);
  form = signal<{ content: string; rating: number }>({ content: '', rating: 5 });
  editingId = signal<number | null>(null);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  // For star rendering in template
  stars = [1, 2, 3, 4, 5];
  hoverRating = signal<number | null>(null);
  maxChars = 1000;
  contentLength = computed(() => this.form().content?.length ?? 0);
  expanded = signal<Set<number>>(new Set());
  modalOpen = signal<boolean>(false);
  modalItem = signal<Testimonial | null>(null);
  // Toasts
  toast = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  private toastTimer: any;
  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast.set({ type, message });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3000);
  }

  // Helpers
  statusClass(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const base = 'status';
    if (!status) return base;
    return `${base} ${status.toLowerCase()}`;
  }

  avatarStyle(id?: number) {
    const palette = [
      ['#79ACD9', '#0583F2'],
      ['#035AA6', '#1B578C'],
      ['#0583F2', '#035AA6'],
      ['#1B578C', '#79ACD9'],
    ];
    const idx = id != null ? Math.abs(id) % palette.length : 0;
    const [c1, c2] = palette[idx];
    return { background: `linear-gradient(135deg, ${c1}, ${c2})` };
  }

  trackById = (_: number, t: Testimonial) => t.id ?? Math.random();

  // UI interactions
  setRating(value: number) {
    const f = this.form();
    this.form.set({ ...f, rating: value });
  }
  setHover(value: number | null) {
    this.hoverRating.set(value);
  }

  // === Modal for full testimonial ===
  selected = signal<Testimonial | null>(null);
  needsClamp(content: string | undefined | null): boolean {
    if (!content) return false;
    return content.trim().length > 140;
  }

  // === Featured carousel ===
  currentSlide = signal<number>(0);
  private autoplayInterval: any = null;
  nextSlide() {
    const total = this.featuredTestimonials().length;
    if (total <= 1) return;
    this.currentSlide.set((this.currentSlide() + 1) % total);
  }
  prevSlide() {
    const total = this.featuredTestimonials().length;
    if (total <= 1) return;
    this.currentSlide.set((this.currentSlide() - 1 + total) % total);
  }
  goToSlide(idx: number) {
    const total = this.featuredTestimonials().length;
    if (total <= 1) return;
    this.currentSlide.set(Math.max(0, Math.min(idx, total - 1)));
  }
  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => this.nextSlide(), 4500);
  }
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  mergedTestimonials = computed(() => {
    const pub = this.publicPage();
    const mine = this.myTestimonial();
    if (!pub) return [];
    const list = [...pub.content];
    if (mine && !list.some(t => t.id === mine.id)) list.unshift(mine);
    return list;
  });

  // Featured subset (first few) for a small carousel highlight
  featuredTestimonials = computed(() => {
    const pub = this.publicPage();
    if (!pub || !pub.content) return [] as Testimonial[];
    return pub.content.slice(0, Math.min(5, pub.content.length));
  });

  constructor() {
    this.loadPublic();

    if (this.role() === 'candidate' || this.role() === 'employer') {
      this.loadMine();
    }
    if (this.role() === 'admin') {
      this.loadAdmin();
    }

    // react to signal changes
    effect(() => { this.pubPageIndex(); this.loadPublic(); });
    effect(() => { this.adminPageIndex(); if (this.role() === 'admin') this.loadAdmin(); });

    // Autoplay handler for featured slider
    effect(() => {
      const items = this.featuredTestimonials();
      if (!items || items.length <= 1) {
        this.stopAutoplay();
      } else {
        this.startAutoplay();
      }
    });
  }

  // === Loads ===
  loadPublic() {
    this.loadingPublic.set(true);
    this.testimonialsSvc.getPublic(this.pubPageIndex(), this.pageSize).subscribe({
      next: pg => { this.publicPage.set(pg); this.loadingPublic.set(false); },
      error: () => { this.errorMsg.set('Failed to load testimonials'); this.loadingPublic.set(false); }
    });
  }

  loadMine() {
    this.testimonialsSvc.getMine(0, 1).subscribe({
      next: pg => {
        const mine = pg?.content?.[0] ?? null;
        this.myTestimonial.set(mine);
        if (mine) {
          this.editingId.set(mine.id!);
          this.form.set({ content: mine.content, rating: mine.rating });
        } else {
          this.editingId.set(null);
          this.form.set({ content: '', rating: 5 });
        }
      },
      error: () => this.myTestimonial.set(null)
    });
  }

  loadAdmin() {
    this.loadingAdmin.set(true);
    this.testimonialsSvc.listAll(this.adminFilter, this.adminPageIndex(), this.adminPageSize).subscribe({
      next: pg => { this.adminPage.set(pg); this.loadingAdmin.set(false); },
      error: () => { this.errorMsg.set('Failed to load admin testimonials'); this.loadingAdmin.set(false); }
    });
  }

  // === Admin filter handler (because adminFilter is a plain prop) ===
  onAdminFilterChange(val: 'PENDING' | 'APPROVED' | 'REJECTED') {
    this.adminFilter = val;
    this.adminPageIndex.set(0);
    if (this.role() === 'admin') this.loadAdmin();
  }

  // === Candidate/Employer actions ===
  openFormForCreate() {
    this.showForm.set(true);
    const mine = this.myTestimonial();
    if (mine) {
      this.editingId.set(mine.id!);
      this.form.set({ content: mine.content, rating: mine.rating });
    } else {
      this.editingId.set(null);
      this.form.set({ content: '', rating: 5 });
    }
  }
  closeForm() { this.showForm.set(false); }

  submit() {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const payload = { ...this.form() };
    const obs = this.editingId()
      ? this.testimonialsSvc.update(this.editingId()!, payload)
      : this.testimonialsSvc.create(payload);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set(this.editingId() ? 'Updated (pending review).' : 'Submitted (pending review).');
        this.showToast(this.successMsg()!, 'success');
        this.showForm.set(false);
        this.loadMine();
        this.loadPublic();
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Action failed. Are you logged in as candidate/employer?');
        this.showToast(this.errorMsg()!, 'error');
      }
    });
  }

  deleteMine() {
    const mine = this.myTestimonial();
    if (!mine?.id) return;
    this.loading.set(true);
    this.testimonialsSvc.delete(mine.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Deleted.');
        this.showToast('Deleted.', 'success');
        this.editingId.set(null);
        this.form.set({ content: '', rating: 5 });
        this.loadMine();
        this.loadPublic();
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Delete failed.');
        this.showToast('Delete failed.', 'error');
      }
    });
  }

  // === Admin actions ===
  approve(id: number) {
    const apg = this.adminPage();
    const previous: { id: number; status: Testimonial['status'] } | null = apg?.content?.find(t => t.id === id) ? { id, status: apg!.content.find(t => t.id === id)!.status } : null;
    // optimistic
    if (apg) {
      const updated = apg.content.map(t => t.id === id ? { ...t, status: 'APPROVED' as const } : t);
      this.adminPage.set({ ...apg, content: updated });
    }
    this.showToast('Approved.', 'success');
    this.testimonialsSvc.approve(id).subscribe({
      next: () => { this.loadPublic(); },
      error: () => {
        if (previous && this.adminPage()) {
          const apg2 = this.adminPage()!;
          const reverted = apg2.content.map(t => t.id === id ? { ...t, status: previous.status } : t);
          this.adminPage.set({ ...apg2, content: reverted });
        }
        this.errorMsg.set('Approve failed.');
        this.showToast('Approve failed.', 'error');
      }
    });
  }
  reject(id: number) {
    const apg = this.adminPage();
    const previous: { id: number; status: Testimonial['status'] } | null = apg?.content?.find(t => t.id === id) ? { id, status: apg!.content.find(t => t.id === id)!.status } : null;
    // optimistic
    if (apg) {
      const updated = apg.content.map(t => t.id === id ? { ...t, status: 'REJECTED' as const } : t);
      this.adminPage.set({ ...apg, content: updated });
    }
    this.showToast('Rejected.', 'success');
    this.testimonialsSvc.reject(id).subscribe({
      next: () => { this.loadPublic(); },
      error: () => {
        if (previous && this.adminPage()) {
          const apg2 = this.adminPage()!;
          const reverted = apg2.content.map(t => t.id === id ? { ...t, status: previous.status } : t);
          this.adminPage.set({ ...apg2, content: reverted });
        }
        this.errorMsg.set('Reject failed.');
        this.showToast('Reject failed.', 'error');
      }
    });
  }

  isExpanded(id: number) {
    return this.expanded().has(id);
  }
  toggleExpand(id: number) {
    const s = new Set(this.expanded());
    s.has(id) ? s.delete(id) : s.add(id);
    this.expanded.set(s);
  }
  

  openModal(t: Testimonial) {
    this.modalItem.set(t);
    this.modalOpen.set(true);
    document.body.classList.add('no-scroll'); // prevent page scroll
  }
  
  closeModal() {
    this.modalOpen.set(false);
    this.modalItem.set(null);
    document.body.classList.remove('no-scroll');
  }
  
  shouldShowMore(text?: string) {
    return (text?.length ?? 0) > 180; // your threshold
  }
  // === Paging ===
  nextPage() { const pg = this.publicPage(); if (pg && !pg.last) this.pubPageIndex.set(this.pubPageIndex() + 1); }
  prevPage() { if (this.pubPageIndex() > 0) this.pubPageIndex.set(this.pubPageIndex() - 1); }

  adminNext() { const pg = this.adminPage(); if (pg && !pg.last) this.adminPageIndex.set(this.adminPageIndex() + 1); }
  adminPrev() { if (this.adminPageIndex() > 0) this.adminPageIndex.set(this.adminPageIndex() - 1); }


}


