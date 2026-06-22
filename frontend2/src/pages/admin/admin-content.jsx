import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  ImageIcon,
  ListFilter,
  Lock,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Search,
  Star,
  Trash2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultSiteContent,
  resetSiteContent,
  saveSiteContent,
  useSiteContent,
} from "@/lib/site-content";

const blankMenuItem = {
  name: "",
  description: "",
  type: "Veg",
  category: "",
  imageUrl: "",
};

const blankReview = {
  customerName: "",
  eventType: "",
  rating: 5,
  comment: "",
};

const ADMIN_AUTH_KEY = "frontend2AdminAuthenticated";
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</Label>
      {children}
    </div>
  );
}

function splitHeroImages(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

function CategoryDropdown({ value, categories, onChange }) {
  const hasCategories = categories.length > 0;
  const valueExists = categories.includes(value);
  const [isAdding, setIsAdding] = useState(!hasCategories || (value && !valueExists));

  const selectValue = isAdding ? "__new__" : value || "";

  return (
    <div className="space-y-2">
      <select
        value={selectValue}
        onChange={(event) => {
          if (event.target.value === "__new__") {
            setIsAdding(true);
            if (!value || valueExists) onChange("");
            return;
          }

          setIsAdding(false);
          onChange(event.target.value);
        }}
        className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs"
      >
        {hasCategories && <option value="">Select category</option>}
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
        <option value="__new__">{hasCategories ? "Add category" : "Add first category"}</option>
      </select>
      {isAdding && (
        <Input
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="New category name"
        />
      )}
    </div>
  );
}

export default function AdminContent() {
  const storedContent = useSiteContent();
  const [content, setContent] = useState(storedContent);
  const [activeSection, setActiveSection] = useState("brand");
  const [savedMessage, setSavedMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(ADMIN_AUTH_KEY) === "true");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [menuTypeFilter, setMenuTypeFilter] = useState("all");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState("all");
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState(blankMenuItem);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState(blankReview);

  const heroImagesText = useMemo(
    () => (content.branding.heroImages || []).join("\n"),
    [content.branding.heroImages],
  );
  const workVideosText = useMemo(
    () => (content.branding.workVideos || []).join("\n"),
    [content.branding.workVideos],
  );

  const menuCategories = useMemo(() => {
    return Array.from(new Set(
      content.menuItems
        .map((item) => item.category)
        .filter(Boolean)
        .map((category) => String(category).trim()),
    )).sort((a, b) => a.localeCompare(b));
  }, [content.menuItems]);

  const visibleMenuItems = useMemo(() => {
    const search = normalizeValue(menuSearch);

    return content.menuItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        const matchesType = menuTypeFilter === "all" || item.type === menuTypeFilter;
        const matchesCategory = menuCategoryFilter === "all" || item.category === menuCategoryFilter;
        const haystack = normalizeValue(`${item.name} ${item.description} ${item.category} ${item.type}`);
        return matchesType && matchesCategory && (!search || haystack.includes(search));
      });
  }, [content.menuItems, menuCategoryFilter, menuSearch, menuTypeFilter]);

  const menuSummary = useMemo(() => {
    const veg = content.menuItems.filter((item) => item.type === "Veg").length;
    const nonVeg = content.menuItems.filter((item) => item.type === "Non-Veg").length;

    return [
      { label: "Total", value: content.menuItems.length },
      { label: "Veg", value: veg },
      { label: "Non-Veg", value: nonVeg },
    ];
  }, [content.menuItems]);

  const reviewSummary = useMemo(() => {
    const reviews = content.reviews || [];
    const average = reviews.length
      ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
      : "0.0";
    return { total: reviews.length, average };
  }, [content.reviews]);

  const updateBranding = (key, value) => {
    setContent((current) => ({
      ...current,
      branding: {
        ...current.branding,
        [key]: value,
      },
    }));
  };

  const updateMenuItem = (index, key, value) => {
    setContent((current) => ({
      ...current,
      menuItems: current.menuItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const openAddMenuDialog = () => {
    setNewMenuItem(blankMenuItem);
    setIsAddMenuOpen(true);
    setActiveSection("menu");
  };

  const updateNewMenuItem = (key, value) => {
    setNewMenuItem((current) => ({ ...current, [key]: value }));
  };

  const updateReview = (index, key, value) => {
    setContent((current) => ({
      ...current,
      reviews: (current.reviews || []).map((review, reviewIndex) =>
        reviewIndex === index ? { ...review, [key]: key === "rating" ? Number(value) : value } : review,
      ),
    }));
  };

  const updateNewReview = (key, value) => {
    setNewReview((current) => ({ ...current, [key]: key === "rating" ? Number(value) : value }));
  };

  const addReview = (event) => {
    event.preventDefault();

    setContent((current) => ({
      ...current,
      reviews: [
        {
          ...newReview,
          id: `review-${Date.now()}`,
          customerName: newReview.customerName.trim() || "Customer",
          eventType: newReview.eventType.trim() || "Event",
          comment: newReview.comment.trim(),
          rating: Number(newReview.rating || 5),
        },
        ...(current.reviews || []),
      ],
    }));
    setIsAddReviewOpen(false);
    setNewReview(blankReview);
  };

  const removeReview = (index) => {
    setContent((current) => ({
      ...current,
      reviews: (current.reviews || []).filter((_, reviewIndex) => reviewIndex !== index),
    }));
  };

  const addMenuItem = (event) => {
    event.preventDefault();

    setContent((current) => ({
      ...current,
      menuItems: [
        {
          ...newMenuItem,
          id: `custom-${Date.now()}`,
          name: newMenuItem.name.trim() || "New Item",
          description: newMenuItem.description.trim(),
          category: newMenuItem.category.trim(),
          imageUrl: newMenuItem.imageUrl.trim(),
        },
        ...current.menuItems,
      ],
    }));
    setMenuCategoryFilter("all");
    setIsAddMenuOpen(false);
    setNewMenuItem(blankMenuItem);
  };

  const removeMenuItem = (index) => {
    setContent((current) => ({
      ...current,
      menuItems: current.menuItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const duplicateMenuItem = (index) => {
    setContent((current) => {
      const source = current.menuItems[index] || blankMenuItem;
      const copy = {
        ...source,
        id: `custom-${Date.now()}`,
        name: `${source.name || "Menu Item"} Copy`,
      };

      return {
        ...current,
        menuItems: [
          ...current.menuItems.slice(0, index + 1),
          copy,
          ...current.menuItems.slice(index + 1),
        ],
      };
    });
  };

  const moveMenuItem = (index, direction) => {
    setContent((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.menuItems.length) return current;

      const menuItems = [...current.menuItems];
      [menuItems[index], menuItems[nextIndex]] = [menuItems[nextIndex], menuItems[index]];
      return { ...current, menuItems };
    });
  };

  const handleSave = () => {
    saveSiteContent(content);
    setSavedMessage("Saved. Open the website in this browser to see the updated content.");
    window.setTimeout(() => setSavedMessage(""), 3500);
  };

  const handleReset = () => {
    resetSiteContent();
    setContent(defaultSiteContent);
    setSavedMessage("Reset to the original website content.");
    window.setTimeout(() => setSavedMessage(""), 3500);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      setLoginError("Admin credentials are not configured.");
      return;
    }
    if (normalizeValue(username) === normalizeValue(ADMIN_USERNAME) && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_AUTH_KEY, "true");
      setIsAuthenticated(true);
      setUsername("");
      setPassword("");
      setLoginError("");
      return;
    }
    setLoginError("Invalid username or password");
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-950 dark:bg-zinc-950 dark:text-white">
        <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-amber-600">
            <ArrowLeft size={16} />
            Website
          </Link>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500 text-white">
              <Lock size={18} />
            </div>
            <div>
              <h1 className="font-playfair text-2xl font-bold">Content Admin</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Username and password required</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="Username">
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setLoginError("");
                  }}
                  className="pl-9"
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setLoginError("");
                }}
                autoComplete="current-password"
                required
              />
            </Field>
            {loginError && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{loginError}</p>}
            <Button type="submit" className="w-full">
              <Lock size={16} />
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-amber-600">
              <ArrowLeft size={16} />
              Website
            </Link>
            <h1 className="font-playfair text-3xl font-bold">Content Admin</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} />
              Save Content
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid h-[calc(100dvh-138px)] max-w-7xl grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden px-4 py-4 sm:h-[calc(100dvh-122px)] sm:px-6 lg:h-[calc(100vh-106px)] lg:grid-cols-[220px_1fr] lg:grid-rows-1 lg:gap-6 lg:py-6">
        <aside className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900 lg:h-full lg:overflow-y-auto">
          {[
            ["brand", "Brand"],
            ["contact", "Contact"],
            ["menu", "Menu Items"],
            ["reviews", "Reviews"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors ${
                activeSection === id
                  ? "bg-amber-500 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </aside>

        <section className="min-h-0 min-w-0 space-y-5 overflow-y-auto pr-1">
          {savedMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {savedMessage}
            </div>
          )}

          {activeSection === "brand" && (
            <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-5 font-playfair text-2xl font-bold">Brand Content</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Company Name">
                  <Input value={content.branding.companyName || ""} onChange={(event) => updateBranding("companyName", event.target.value)} />
                </Field>
                <Field label="Tagline">
                  <Input value={content.branding.tagline || ""} onChange={(event) => updateBranding("tagline", event.target.value)} />
                </Field>
                <Field label="Years Experience">
                  <Input type="number" value={content.branding.yearsExperience || ""} onChange={(event) => updateBranding("yearsExperience", event.target.value)} />
                </Field>
                <Field label="Events Per Year">
                  <Input type="number" value={content.branding.eventsPerYear || ""} onChange={(event) => updateBranding("eventsPerYear", event.target.value)} />
                </Field>
                <Field label="Logo URL">
                  <Input value={content.branding.logoUrl || ""} onChange={(event) => updateBranding("logoUrl", event.target.value)} />
                </Field>
                <Field label="UPI ID">
                  <Input value={content.branding.upiId || ""} onChange={(event) => updateBranding("upiId", event.target.value)} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Description">
                    <Textarea rows={4} value={content.branding.description || ""} onChange={(event) => updateBranding("description", event.target.value)} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Hero Images, One URL Per Line">
                    <Textarea rows={5} value={heroImagesText} onChange={(event) => updateBranding("heroImages", splitHeroImages(event.target.value))} />
                  </Field>
                </div>
                <Field label="Owner Name">
                  <Input value={content.branding.ownerName || ""} onChange={(event) => updateBranding("ownerName", event.target.value)} />
                </Field>
                <Field label="Owner Role">
                  <Input value={content.branding.ownerRole || ""} onChange={(event) => updateBranding("ownerRole", event.target.value)} />
                </Field>
                <Field label="Owner Photo URL">
                  <Input value={content.branding.ownerImageUrl || ""} onChange={(event) => updateBranding("ownerImageUrl", event.target.value)} />
                </Field>
                <Field label="Owner Phone">
                  <Input value={content.branding.ownerPhone || ""} onChange={(event) => updateBranding("ownerPhone", event.target.value)} />
                </Field>
                <Field label="Owner Email">
                  <Input type="email" value={content.branding.ownerEmail || ""} onChange={(event) => updateBranding("ownerEmail", event.target.value)} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Owner Bio">
                    <Textarea rows={4} value={content.branding.ownerBio || ""} onChange={(event) => updateBranding("ownerBio", event.target.value)} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Work Video URLs, One Per Line">
                    <Textarea rows={5} value={workVideosText} placeholder={"https://youtube.com/watch?v=...\nhttps://example.com/event.mp4"} onChange={(event) => updateBranding("workVideos", splitHeroImages(event.target.value))} />
                    <p className="mt-2 text-xs text-zinc-500">Add each new daily video on a separate line. YouTube, Vimeo, MP4/WebM, and external links are supported.</p>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {activeSection === "contact" && (
            <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-5 font-playfair text-2xl font-bold">Contact Content</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Phone">
                  <Input value={content.branding.phone || ""} onChange={(event) => updateBranding("phone", event.target.value)} />
                </Field>
                <Field label="Contact Phone">
                  <Input value={content.branding.contactPhone || ""} onChange={(event) => updateBranding("contactPhone", event.target.value)} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={content.branding.email || ""} onChange={(event) => updateBranding("email", event.target.value)} />
                </Field>
                <Field label="Contact Email">
                  <Input type="email" value={content.branding.contactEmail || ""} onChange={(event) => updateBranding("contactEmail", event.target.value)} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Address">
                    <Textarea rows={3} value={content.branding.address || ""} onChange={(event) => updateBranding("address", event.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {activeSection === "menu" && (
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h2 className="font-playfair text-2xl font-bold">Menu Content</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Edit dishes, categories, images, and display order.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 xl:min-w-[320px]">
                  {menuSummary.map((stat) => (
                    <div key={stat.label} className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={menuSearch}
                    onChange={(event) => setMenuSearch(event.target.value)}
                    placeholder="Search menu items"
                    className="pl-9"
                  />
                </div>
                <select
                  value={menuTypeFilter}
                  onChange={(event) => setMenuTypeFilter(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
                <select
                  value={menuCategoryFilter}
                  onChange={(event) => setMenuCategoryFilter(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All Categories</option>
                  {menuCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Button onClick={openAddMenuDialog}>
                  <Plus size={16} />
                  Add Item
                </Button>
              </div>

              {visibleMenuItems.length === 0 ? (
                <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center dark:border-zinc-700">
                  <ListFilter className="mx-auto mb-3 size-8 text-zinc-400" />
                  <p className="font-semibold">No menu items match the current filters.</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Clear the search or choose a different type/category.</p>
                </div>
              ) : (
                <div className="min-h-[220px] flex-1 space-y-4 overflow-y-auto overscroll-contain pr-2">
                  {visibleMenuItems.map(({ item, index }) => (
                    <div key={item.id || index} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                      <div className="mb-4 grid gap-4 lg:grid-cols-[128px_1fr_auto]">
                        <div className="aspect-[4/3] overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="min-w-0 truncate text-lg font-bold">{item.name || "Untitled Item"}</h3>
                            <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                              item.type === "Non-Veg"
                                ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            }`}>
                              {item.type || "Veg"}
                            </span>
                            {item.category && (
                              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                            {item.description || "No description added."}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <Button variant="outline" size="icon" onClick={() => moveMenuItem(index, -1)} disabled={index === 0} aria-label="Move item up">
                            <ArrowUp size={14} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => moveMenuItem(index, 1)} disabled={index === content.menuItems.length - 1} aria-label="Move item down">
                            <ArrowDown size={14} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => duplicateMenuItem(index)} aria-label="Duplicate item">
                            <Copy size={14} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => removeMenuItem(index)} aria-label="Remove item">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_160px_1fr]">
                        <Field label="Name">
                          <Input value={item.name || ""} onChange={(event) => updateMenuItem(index, "name", event.target.value)} />
                        </Field>
                        <Field label="Type">
                          <select
                            value={item.type || "Veg"}
                            onChange={(event) => updateMenuItem(index, "type", event.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option>Veg</option>
                            <option>Non-Veg</option>
                          </select>
                        </Field>
                        <Field label="Category">
                          <CategoryDropdown
                            value={item.category || ""}
                            categories={menuCategories}
                            onChange={(value) => updateMenuItem(index, "category", value)}
                          />
                        </Field>
                        <div className="md:col-span-2 xl:col-span-3">
                          <Field label="Image URL">
                            <Input value={item.imageUrl || ""} onChange={(event) => updateMenuItem(index, "imageUrl", event.target.value)} />
                          </Field>
                        </div>
                        <div className="md:col-span-2 xl:col-span-3">
                          <Field label="Description">
                            <Textarea rows={3} value={item.description || ""} onChange={(event) => updateMenuItem(index, "description", event.target.value)} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === "reviews" && (
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-playfair text-2xl font-bold">Reviews</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Manage customer testimonials shown on the home page.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Total</p>
                    <p className="text-xl font-bold">{reviewSummary.total}</p>
                  </div>
                  <div className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Average</p>
                    <p className="text-xl font-bold">{reviewSummary.average}</p>
                  </div>
                  <Button onClick={() => setIsAddReviewOpen(true)}>
                    <Plus size={16} />
                    Add Review
                  </Button>
                </div>
              </div>

              {(content.reviews || []).length === 0 ? (
                <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center dark:border-zinc-700">
                  <Star className="mx-auto mb-3 size-8 text-zinc-400" />
                  <p className="font-semibold">No reviews yet.</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Add a review to show testimonials on the home page.</p>
                </div>
              ) : (
                <div className="min-h-[220px] flex-1 space-y-4 overflow-y-auto overscroll-contain pr-2">
                  {(content.reviews || []).map((review, index) => (
                    <div key={review.id || index} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{review.customerName || "Customer"}</h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{review.eventType || "Event"}</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => removeReview(index)} aria-label="Remove review">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
                        <Field label="Customer Name">
                          <Input value={review.customerName || ""} onChange={(event) => updateReview(index, "customerName", event.target.value)} />
                        </Field>
                        <Field label="Event Type">
                          <Input value={review.eventType || ""} onChange={(event) => updateReview(index, "eventType", event.target.value)} />
                        </Field>
                        <Field label="Rating">
                          <select
                            value={review.rating || 5}
                            onChange={(event) => updateReview(index, "rating", event.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <option key={rating} value={rating}>{rating}</option>
                            ))}
                          </select>
                        </Field>
                        <div className="md:col-span-3">
                          <Field label="Comment">
                            <Textarea rows={3} value={review.comment || ""} onChange={(event) => updateReview(index, "comment", event.target.value)} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>Create a menu item and choose an existing category or add a new one.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addMenuItem} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1.4fr_160px]">
              <Field label="Name">
                <Input
                  value={newMenuItem.name}
                  onChange={(event) => updateNewMenuItem("name", event.target.value)}
                  placeholder="Item name"
                  autoFocus
                />
              </Field>
              <Field label="Type">
                <select
                  value={newMenuItem.type}
                  onChange={(event) => updateNewMenuItem("type", event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option>Veg</option>
                  <option>Non-Veg</option>
                </select>
              </Field>
            </div>
            <Field label="Category">
              <CategoryDropdown
                value={newMenuItem.category}
                categories={menuCategories}
                onChange={(value) => updateNewMenuItem("category", value)}
              />
            </Field>
            <Field label="Image URL">
              <Input
                value={newMenuItem.imageUrl}
                onChange={(event) => updateNewMenuItem("imageUrl", event.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={4}
                value={newMenuItem.description}
                onChange={(event) => updateNewMenuItem("description", event.target.value)}
                placeholder="Short description"
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddMenuOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus size={16} />
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
            <DialogDescription>Create a customer review for the home page testimonials.</DialogDescription>
          </DialogHeader>
          <form onSubmit={addReview} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
              <Field label="Customer Name">
                <Input
                  value={newReview.customerName}
                  onChange={(event) => updateNewReview("customerName", event.target.value)}
                  placeholder="Customer name"
                  autoFocus
                />
              </Field>
              <Field label="Event Type">
                <Input
                  value={newReview.eventType}
                  onChange={(event) => updateNewReview("eventType", event.target.value)}
                  placeholder="Wedding, Birthday, Corporate"
                />
              </Field>
              <Field label="Rating">
                <select
                  value={newReview.rating}
                  onChange={(event) => updateNewReview("rating", event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Comment">
              <Textarea
                rows={4}
                value={newReview.comment}
                onChange={(event) => updateNewReview("comment", event.target.value)}
                placeholder="Customer feedback"
                required
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddReviewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus size={16} />
                Add Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
