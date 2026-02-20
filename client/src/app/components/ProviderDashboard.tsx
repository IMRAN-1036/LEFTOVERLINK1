import { useState, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
    UtensilsCrossed,
    Plus,
    List,
    Bell,
    User as UserIcon,
    LogOut,
    Clock,
    Users,
    Leaf,
    Trash2,
    CheckCircle,
    Wallet
} from 'lucide-react';
import { getTimeLeft } from '../mockData';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { ProviderWallet } from '../types';
import api from '../api/axios';
import { InsightBanner } from '../features/insights/InsightBanner';
import { getProviderInsights } from '../shared/ai/insightEngine';

export function ProviderDashboard() {
    const navigate = useNavigate();

    // Move fetchData to outer scope so other listeners can call it
    const fetchData = async () => {
        try {
            const userRes = await api.get('/auth/me');
            const user = userRes.data;
            const mappedWallet = {
                balanceINR: user.wallet || 0,
                totalEarnings: user.totalEarnings || 0,
                totalMealsDonated: user.totalMealsDonated || 0,
                transactions: user.transactions || []
            };
            setWallet(mappedWallet as ProviderWallet);

            const foodsRes = await api.get('/food');
            const allFoods = foodsRes.data;
            const myListings = allFoods.filter((f: any) => {
                const providerId = f.provider?._id || f.provider;
                return String(providerId) === String(user._id || user.id);
            }).map((f: any) => ({
                id: f._id || f.id,
                foodType: f.title || f.foodType || 'Food',
                isVeg: f.isVeg ?? true,
                quantity: f.quantity || 0,
                status: f.status || 'available',
                expiryTime: new Date(f.expiry || f.expiryTime || f.postedAt),
                views: f.views || 0,
                interested: f.interested || 0,
                reservedBy: f.reservedBy
            }));
            setListings(myListings);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== 'provider') {
                navigate('/receiver');
            }
        } else {
            navigate('/login');
        }

        fetchData();

        // Listen for cross-tab/local updates so new posts show up
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'refreshProviderListings') {
                fetchData();
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [navigate]);

    // Also refetch when navigated with state.refresh (immediate in same tab)
    const location = useRouterLocation();
    useEffect(() => {
        if ((location as any)?.state?.refresh) {
            fetchData();
            // clear the state so it doesn't refetch repeatedly
            try {
                // replace state without refresh flag
                history.replaceState({ ...history.state, state: { ...(history.state && history.state.state), refresh: false } }, '');
            } catch (e) {}
        }
    }, [location]);

    // State for dynamic stats
    const [wallet, setWallet] = useState<ProviderWallet | null>(null);

    // Listings come from API
    const [listings, setListings] = useState<any[]>([]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const removeListing = async (id: string) => {
        try {
            // attempt to delete via API (if implemented)
            await api.delete(`/food/${id}`);
            setListings((prev) => prev.filter(l => l.id !== id));
            toast.success('Listing removed');
        } catch (err) {
            // fallback to local removal
            setListings((prev) => prev.filter(l => l.id !== id));
            toast.success('Listing removed');
        }
    };

    const insights = getProviderInsights(listings.length);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-background border-b px-4 py-3 sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>
                        <UtensilsCrossed className="w-8 h-8" />
                        <span>LeftOverLink <Badge variant="outline" className="ml-2 text-xs">Provider</Badge></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 font-bold gap-2 px-3 h-9"
                            onClick={() => navigate('/provider-wallet')}
                        >
                            <Wallet className="w-4 h-4" />
                            <span className="hidden sm:inline">Wallet</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')}>
                            <Bell className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                            <UserIcon className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="w-5 h-5 text-red-500" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Quick Actions & Stats */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-green-600 text-white shadow-xl flex flex-col justify-between min-h-[200px]">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Share Food</h2>
                                <p className="text-green-50/80 text-sm mb-6">Have surplus food? Post it today and help someone in need.</p>
                            </div>
                            <Button
                                className="w-full bg-white text-green-600 hover:bg-green-50 font-bold"
                                onClick={() => navigate('/post-food')}
                            >
                                <Plus className="w-5 h-5 mr-2" /> Start Sharing
                            </Button>
                        </Card>

                        <InsightBanner insights={insights} />

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                                <span className="text-3xl font-bold text-green-600">{listings.length}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Posts</span>
                            </Card>
                            <Card
                                className="p-4 flex flex-col items-center justify-center text-center space-y-1 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => navigate('/provider-wallet')}
                            >
                                <span className="text-3xl font-bold text-blue-600">₹{wallet?.balanceINR.toFixed(0) || '0'}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Balance</span>
                            </Card>
                            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                                <span className="text-3xl font-bold text-yellow-600">{listings.filter(l => l.status === 'claimed').length}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Reserved</span>
                            </Card>
                            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                                <span className="text-3xl font-bold text-purple-600">{listings.reduce((sum, l) => sum + (l.views || 0), 0)}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Views</span>
                            </Card>
                            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1 col-span-2">
                                <span className="text-3xl font-bold text-orange-600">{wallet?.totalMealsDonated || '0'}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Meals Donated</span>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Active Listings */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <List className="w-6 h-6 text-green-600" />
                                Your Active Listings
                            </h2>
                            <Button variant="link" onClick={() => navigate('/my-listings')}>View All</Button>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {listings.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Card className="p-5 border-l-4 border-l-green-600">
                                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center justify-between md:justify-start gap-4">
                                                        <h3 className="text-lg font-bold">{item.foodType}</h3>
                                                        <Badge variant={item.isVeg ? "outline" : "secondary"}>
                                                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                                                        </Badge>
                                                        <Badge className={item.status === 'reserved' ? 'bg-yellow-500' : 'bg-green-600'}>
                                                            {item.status.toUpperCase()}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            <span>Feeds ~{item.quantity}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>Expires in {getTimeLeft(item.expiryTime)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium text-green-600">👁️ {item.views} views</span>
                                                        </div>
                                                    </div>

                                                    {item.reservedBy && (
                                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-xs border border-yellow-200 dark:border-yellow-900/50">
                                                            <strong>Reserved by:</strong> {item.reservedBy}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 min-w-[120px]">
                                                    {item.status === 'reserved' && (
                                                        <Button size="sm" className="flex-1 bg-green-600" onClick={() => toast.success('Marked as collected')}>
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => removeListing(item.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {listings.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                                    No active listings. Start sharing surplus food!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
