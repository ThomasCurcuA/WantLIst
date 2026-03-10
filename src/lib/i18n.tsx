"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Language = "en" | "it";

const LANG_KEY = "wantlist-lang";

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.wishes": "Wishes",
    "nav.categories": "Cats",
    "nav.bought": "Bought",
    "nav.profile": "Profile",

    // WishesScreen
    "wishes.welcomeBack": "Welcome Back",
    "wishes.myWishes": "My Wishes",
    "wishes.totalSaved": "Total Saved Value",
    "wishes.items": "Items",
    "wishes.all": "All",
    "wishes.noItems": "No items yet",
    "wishes.startAdding": "Start adding your dream purchases!",
    "wishes.addFirst": "Add Your First Item",
    "wishes.swipeBought": "Bought \u2192",
    "wishes.swipeDelete": "\u2190 Delete",

    // CategoriesScreen
    "categories.organize": "Organize",
    "categories.title": "Categories",
    "categories.yourCollections": "Your Collections",
    "categories.totalItems": "total items",
    "categories.noItems": "No items in categories yet",
    "categories.allCategories": "All Categories",
    "categories.editCategory": "Edit Category",
    "categories.newCategory": "New Category",
    "categories.categoryName": "Category Name",
    "categories.icon": "Icon",
    "categories.color": "Color",
    "categories.deleteCategory": "Delete Category",
    "categories.createCategory": "Create Category",
    "categories.updateCategory": "Update Category",
    "categories.deleteConfirm": "Delete Category?",
    "categories.deleteDesc": "This won\u2019t delete your wishes, but they\u2019ll lose their category.",
    "categories.items": "items",

    // BoughtScreen
    "bought.completed": "Completed",
    "bought.purchased": "Purchased",
    "bought.totalSpent": "Total Spent",
    "bought.itemsPurchased": "items purchased",
    "bought.swipeRestore": "Restore \u2192",
    "bought.swipeDelete": "\u2190 Delete",
    "bought.noPurchases": "No purchases yet",
    "bought.swipeHint": "Swipe right on a wish to mark it as bought!",
    "bought.restore": "Restore",
    "bought.delete": "Delete",

    // AuthScreen
    "auth.tagline": "Track your dream purchases",
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.username": "Username",
    "auth.usernameRequired": "Please enter a username",
    "auth.fillFields": "Please fill in all fields",
    "auth.accountCreated": "Account created! Check your email to confirm your account.",
    "auth.loading": "Loading...",
    "auth.createAccount": "Create Account",
    "auth.or": "or",
    "auth.google": "Continue with Google",

    // ProfileScreen
    "profile.title": "Profile",
    "profile.memberSince": "Member since",
    "profile.active": "Active",
    "profile.totalWishes": "Total Wishes",
    "profile.purchased": "Purchased",
    "profile.totalValueSaved": "Total Value Saved",
    "profile.topCategories": "Top Categories",
    "profile.purchasedItems": "Purchased Items",
    "profile.itemsBought": "items bought",
    "profile.settings": "Settings",
    "profile.accountDetails": "Account Details",
    "profile.appearance": "Appearance",
    "profile.signOut": "Sign Out",

    // AccountScreen
    "account.title": "Account Details",
    "account.avatarHint": "Tap to change avatar (coming soon)",
    "account.username": "Username",
    "account.displayName": "Your display name",
    "account.email": "Email",
    "account.memberSince": "Member Since",
    "account.accountId": "Account ID",
    "account.saveChanges": "Save Changes",
    "account.saving": "Saving...",

    // AppearanceScreen
    "appearance.title": "Appearance",
    "appearance.theme": "Theme",
    "appearance.themeDesc": "Switch between light and dark mode",
    "appearance.light": "Light",
    "appearance.dark": "Dark",
    "appearance.language": "Language",
    "appearance.languageDesc": "Choose the app language",
    "appearance.accentColor": "Accent Color",
    "appearance.accentDesc": "Choose the main color for buttons and highlights",
    "appearance.cardStyle": "Card Style",
    "appearance.cardDesc": "Choose the roundness of cards and buttons",
    "appearance.preview": "Preview",
    "appearance.sampleItem": "Sample Wish Item",
    "appearance.apply": "Apply Changes",
    "appearance.saved": "Saved!",
    "appearance.borderRadius": "border radius",

    // Card style names
    "style.rounded": "Rounded",
    "style.soft": "Soft",
    "style.sharp": "Sharp",

    // Color names
    "color.rose": "Rose",
    "color.blue": "Blue",
    "color.purple": "Purple",
    "color.green": "Green",
    "color.amber": "Amber",
    "color.teal": "Teal",
    "color.indigo": "Indigo",
    "color.slate": "Slate",

    // ProductDetailScreen
    "detail.title": "Product Details",
    "detail.purchasedBadge": "Purchased \u2713",
    "detail.openLink": "Open Product Link",
    "detail.productName": "Product Name",
    "detail.notes": "Notes",
    "detail.notesPlaceholder": "Add any notes or details...",
    "detail.price": "Price",
    "detail.priority": "Priority",
    "detail.category": "Category",
    "detail.moveBack": "Move Back to Wishes",
    "detail.markBought": "Mark as Bought",
    "detail.deleteItem": "Delete Item",
    "detail.deleteConfirm": "Delete this item?",
    "detail.deleteDesc": "will be permanently removed. This cannot be undone.",
    "detail.saveChanges": "Save Changes",
    "detail.saving": "Saving...",

    // AddWishScreen
    "add.title": "Add New Wish",
    "add.manual": "Manual",
    "add.fromLink": "From Link",
    "add.productUrl": "Product Page URL",
    "add.howItWorks": "How it works",
    "add.step1": "Paste a product page URL",
    "add.step2": "We extract name, price & image",
    "add.step3": "Review and confirm before saving",
    "add.extractData": "Extract Product Data",
    "add.extracting": "Extracting data...",
    "add.confirmProduct": "Confirm Product",
    "add.itemName": "Item Name",
    "add.description": "Description",
    "add.noImage": "No image found from the link",
    "add.searchImageOnline": "Search Image Online",
    "add.searchImage": "Search Image",
    "add.searchPlaceholder": "Search for product images...",
    "add.noImagesFound": "No images found. Try a different search.",
    "add.searchingImages": "Searching images...",
    "add.searchForImages": "Search for images of your product",
    "add.tapToSelect": "Tap on an image to select it",
    "add.change": "Change",
    "add.tapToUpload": "Tap to upload image",
    "add.fileTypes": "JPG, PNG up to 5MB",
    "add.notes": "Notes",
    "add.notesPlaceholder": "Add any notes or details...",
    "add.price": "Price",
    "add.priority": "Priority",
    "add.category": "Category",
    "add.confirmSave": "Confirm & Save",
    "add.saving": "Saving...",
    "add.saveToWishlist": "Save to Wishlist",
    "add.search": "Search",
    "add.tapToChange": "Tap to change",
    "add.networkError": "Network error, try again",

    // WishCard
    "card.bought": "Bought",
    "card.delete": "Delete",

    // Common
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.items": "items",

    // Sharing
    "share.title": "Share Wishlist",
    "share.searchPlaceholder": "Search by username...",
    "share.searchUsers": "Search Users",
    "share.noResults": "No users found",
    "share.selectItems": "Select items to share",
    "share.selectAll": "Select All",
    "share.deselectAll": "Deselect All",
    "share.message": "Message (optional)",
    "share.messagePlaceholder": "Add a note for the recipient...",
    "share.send": "Share",
    "share.sending": "Sharing...",
    "share.sent": "Shared!",
    "share.noItemsSelected": "Select at least one item",
    "share.selectedCount": "selected",
    "shared.title": "Shared Lists",
    "shared.from": "From",
    "shared.received": "Received",
    "shared.items": "items",
    "shared.noLists": "No shared lists yet",
    "shared.noListsDesc": "When someone shares their wishlist with you, it will appear here.",
    "shared.message": "Message",
    "profile.sharedLists": "Shared Lists",
    "profile.listsReceived": "lists received",
  },
  it: {
    // Navigation
    "nav.wishes": "Desideri",
    "nav.categories": "Categorie",
    "nav.bought": "Acquistati",
    "nav.profile": "Profilo",

    // WishesScreen
    "wishes.welcomeBack": "Bentornato",
    "wishes.myWishes": "I Miei Desideri",
    "wishes.totalSaved": "Valore Totale Salvato",
    "wishes.items": "Articoli",
    "wishes.all": "Tutti",
    "wishes.noItems": "Nessun articolo",
    "wishes.startAdding": "Inizia ad aggiungere i tuoi acquisti desiderati!",
    "wishes.addFirst": "Aggiungi il Primo Articolo",
    "wishes.swipeBought": "Comprato \u2192",
    "wishes.swipeDelete": "\u2190 Elimina",

    // CategoriesScreen
    "categories.organize": "Organizza",
    "categories.title": "Categorie",
    "categories.yourCollections": "Le Tue Collezioni",
    "categories.totalItems": "articoli totali",
    "categories.noItems": "Nessun articolo nelle categorie",
    "categories.allCategories": "Tutte le Categorie",
    "categories.editCategory": "Modifica Categoria",
    "categories.newCategory": "Nuova Categoria",
    "categories.categoryName": "Nome Categoria",
    "categories.icon": "Icona",
    "categories.color": "Colore",
    "categories.deleteCategory": "Elimina Categoria",
    "categories.createCategory": "Crea Categoria",
    "categories.updateCategory": "Aggiorna Categoria",
    "categories.deleteConfirm": "Eliminare la Categoria?",
    "categories.deleteDesc": "I tuoi desideri non verranno eliminati, ma perderanno la loro categoria.",
    "categories.items": "articoli",

    // BoughtScreen
    "bought.completed": "Completati",
    "bought.purchased": "Acquistati",
    "bought.totalSpent": "Totale Speso",
    "bought.itemsPurchased": "articoli acquistati",
    "bought.swipeRestore": "Ripristina \u2192",
    "bought.swipeDelete": "\u2190 Elimina",
    "bought.noPurchases": "Nessun acquisto",
    "bought.swipeHint": "Scorri a destra su un desiderio per segnarlo come acquistato!",
    "bought.restore": "Ripristina",
    "bought.delete": "Elimina",

    // AuthScreen
    "auth.tagline": "Tieni traccia dei tuoi acquisti desiderati",
    "auth.signIn": "Accedi",
    "auth.signUp": "Registrati",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.username": "Nome Utente",
    "auth.usernameRequired": "Inserisci un nome utente",
    "auth.fillFields": "Compila tutti i campi",
    "auth.accountCreated": "Account creato! Controlla la tua email per confermare.",
    "auth.loading": "Caricamento...",
    "auth.createAccount": "Crea Account",
    "auth.or": "oppure",
    "auth.google": "Continua con Google",

    // ProfileScreen
    "profile.title": "Profilo",
    "profile.memberSince": "Membro dal",
    "profile.active": "Attivo",
    "profile.totalWishes": "Desideri Totali",
    "profile.purchased": "Acquistati",
    "profile.totalValueSaved": "Valore Totale Salvato",
    "profile.topCategories": "Categorie Principali",
    "profile.purchasedItems": "Articoli Acquistati",
    "profile.itemsBought": "articoli acquistati",
    "profile.settings": "Impostazioni",
    "profile.accountDetails": "Dettagli Account",
    "profile.appearance": "Aspetto",
    "profile.signOut": "Esci",

    // AccountScreen
    "account.title": "Dettagli Account",
    "account.avatarHint": "Tocca per cambiare avatar (prossimamente)",
    "account.username": "Nome Utente",
    "account.displayName": "Il tuo nome visualizzato",
    "account.email": "Email",
    "account.memberSince": "Membro Dal",
    "account.accountId": "ID Account",
    "account.saveChanges": "Salva Modifiche",
    "account.saving": "Salvataggio...",

    // AppearanceScreen
    "appearance.title": "Aspetto",
    "appearance.theme": "Tema",
    "appearance.themeDesc": "Passa tra la modalit\u00e0 chiara e scura",
    "appearance.light": "Chiaro",
    "appearance.dark": "Scuro",
    "appearance.language": "Lingua",
    "appearance.languageDesc": "Scegli la lingua dell'app",
    "appearance.accentColor": "Colore Accento",
    "appearance.accentDesc": "Scegli il colore principale per pulsanti e evidenziazioni",
    "appearance.cardStyle": "Stile Schede",
    "appearance.cardDesc": "Scegli la rotondit\u00e0 delle schede e dei pulsanti",
    "appearance.preview": "Anteprima",
    "appearance.sampleItem": "Articolo di Esempio",
    "appearance.apply": "Applica Modifiche",
    "appearance.saved": "Salvato!",
    "appearance.borderRadius": "raggio bordo",

    // Card style names
    "style.rounded": "Arrotondato",
    "style.soft": "Morbido",
    "style.sharp": "Netto",

    // Color names
    "color.rose": "Rosa",
    "color.blue": "Blu",
    "color.purple": "Viola",
    "color.green": "Verde",
    "color.amber": "Ambra",
    "color.teal": "Verde Acqua",
    "color.indigo": "Indaco",
    "color.slate": "Ardesia",

    // ProductDetailScreen
    "detail.title": "Dettagli Prodotto",
    "detail.purchasedBadge": "Acquistato \u2713",
    "detail.openLink": "Apri Link Prodotto",
    "detail.productName": "Nome Prodotto",
    "detail.notes": "Note",
    "detail.notesPlaceholder": "Aggiungi note o dettagli...",
    "detail.price": "Prezzo",
    "detail.priority": "Priorit\u00e0",
    "detail.category": "Categoria",
    "detail.moveBack": "Riporta nei Desideri",
    "detail.markBought": "Segna come Acquistato",
    "detail.deleteItem": "Elimina Articolo",
    "detail.deleteConfirm": "Eliminare questo articolo?",
    "detail.deleteDesc": "verr\u00e0 rimosso permanentemente. Non pu\u00f2 essere annullato.",
    "detail.saveChanges": "Salva Modifiche",
    "detail.saving": "Salvataggio...",

    // AddWishScreen
    "add.title": "Aggiungi Desiderio",
    "add.manual": "Manuale",
    "add.fromLink": "Da Link",
    "add.productUrl": "URL Pagina Prodotto",
    "add.howItWorks": "Come funziona",
    "add.step1": "Incolla l'URL di una pagina prodotto",
    "add.step2": "Estraiamo nome, prezzo e immagine",
    "add.step3": "Rivedi e conferma prima di salvare",
    "add.extractData": "Estrai Dati Prodotto",
    "add.extracting": "Estrazione dati...",
    "add.confirmProduct": "Conferma Prodotto",
    "add.itemName": "Nome Articolo",
    "add.description": "Descrizione",
    "add.noImage": "Nessuna immagine trovata dal link",
    "add.searchImageOnline": "Cerca Immagine Online",
    "add.searchImage": "Cerca Immagine",
    "add.searchPlaceholder": "Cerca immagini del prodotto...",
    "add.noImagesFound": "Nessuna immagine trovata. Prova una ricerca diversa.",
    "add.searchingImages": "Ricerca immagini...",
    "add.searchForImages": "Cerca immagini del tuo prodotto",
    "add.tapToSelect": "Tocca un'immagine per selezionarla",
    "add.change": "Cambia",
    "add.tapToUpload": "Tocca per caricare un'immagine",
    "add.fileTypes": "JPG, PNG fino a 5MB",
    "add.notes": "Note",
    "add.notesPlaceholder": "Aggiungi note o dettagli...",
    "add.price": "Prezzo",
    "add.priority": "Priorit\u00e0",
    "add.category": "Categoria",
    "add.confirmSave": "Conferma e Salva",
    "add.saving": "Salvataggio...",
    "add.saveToWishlist": "Salva nella Wishlist",
    "add.search": "Cerca",
    "add.tapToChange": "Tocca per cambiare",
    "add.networkError": "Errore di rete, riprova",

    // WishCard
    "card.bought": "Acquistato",
    "card.delete": "Elimina",

    // Common
    "common.cancel": "Annulla",
    "common.delete": "Elimina",
    "common.items": "articoli",

    // Sharing
    "share.title": "Condividi Wishlist",
    "share.searchPlaceholder": "Cerca per username...",
    "share.searchUsers": "Cerca Utenti",
    "share.noResults": "Nessun utente trovato",
    "share.selectItems": "Seleziona articoli da condividere",
    "share.selectAll": "Seleziona Tutti",
    "share.deselectAll": "Deseleziona Tutti",
    "share.message": "Messaggio (opzionale)",
    "share.messagePlaceholder": "Aggiungi una nota per il destinatario...",
    "share.send": "Condividi",
    "share.sending": "Condivisione...",
    "share.sent": "Condiviso!",
    "share.noItemsSelected": "Seleziona almeno un articolo",
    "share.selectedCount": "selezionati",
    "shared.title": "Liste Condivise",
    "shared.from": "Da",
    "shared.received": "Ricevuta",
    "shared.items": "articoli",
    "shared.noLists": "Nessuna lista condivisa",
    "shared.noListsDesc": "Quando qualcuno condivide la sua wishlist con te, apparir\u00e0 qui.",
    "shared.message": "Messaggio",
    "profile.sharedLists": "Liste Condivise",
    "profile.listsReceived": "liste ricevute",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "it") return stored;
  } catch { /* ignore */ }
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getStoredLanguage());
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  const { language } = useLanguage();
  return useCallback(
    (key: string): string => translations[language]?.[key] || translations.en[key] || key,
    [language]
  );
}
