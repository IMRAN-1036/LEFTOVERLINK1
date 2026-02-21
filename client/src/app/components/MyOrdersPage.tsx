import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { ShoppingBag, ArrowLeft, Clock, MapPin, Loader2, MessageCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ChatDialog } from './ChatDialog';

export function MyOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Chat States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChatOrder, setActiveChatOrder] = useState<{ id: string, providerName: string } | null>(null);

    useEffect(() => {
        // Load orders purely from localStorage to match existing application logic
        const loadOrders = () => {
            try {
                const history = localStorage.getItem('pickupHistory');
                if (history) {
                    setOrders(JSON.parse(history));
                }
            } catch (err) {
                console.error("Failed to parse orders", err);
            } finally {
                setIsLoading(false);
            }
        };

        // Small delay to simulate loading for premium feel
        const timeoutId = setTimeout(loadOrders, 600);
        return () => clearTimeout(timeoutId);
    }, []);

    const handleOpenChat = (orderId: string, providerName: string) => {
        setActiveChatOrder({ id: orderId, providerName });
        setIsChatOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans selection:bg-green-500/30">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 mt-20 max-w-5xl flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/receiver')}
                        className="rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                            <ShoppingBag className="w-8 h-8 text-green-600" />
                            My Orders
                        </h1>
                        <p className="text-muted-foreground mt-1">Track your claimed donations and communicate with providers.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                        <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-border/50 shadow-sm min-h-[400px]">
                        <div className="w-24 h-24 mb-6 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-green-600 opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            You haven't claimed any food yet. Head over to the dashboard to find available donations near you.
                        </p>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-green-600/20 hover:scale-105 transition-all"
                            onClick={() => navigate('/receiver')}
                        >
                            Browse Donations
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {orders.map((order, idx) => (
                                <motion.div
                                    key={order.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Order Details Column */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-xl font-bold">{order.foodType || 'Food Donation'}</h3>
                                                        <Badge variant="outline" className={`${order.paymentStatus === 'completed' ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10' : 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-500/10'}`}>
                                                            {order.paymentStatus === 'completed' ? 'Paid' : 'Payment Pending'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground font-medium flex items-center gap-1.5 text-sm">
                                                        <MapPin className="w-4 h-4 text-green-600" />
                                                        Provider: {order.providerName || 'Anonymous'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-dashed border-border/60">
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Meals Requested</p>
                                                    <p className="font-semibold text-lg">{order.numberOfMeals || 1}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Bill</p>
                                                    <p className="font-bold text-lg text-green-600">₹{order.totalPrice || 0}</p>
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Claimed At</p>
                                                    <p className="font-medium text-sm flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {order.pickupTime ? formatDistanceToNow(new Date(order.pickupTime), { addSuffix: true }) : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Column */}
                                        <div className="flex flex-row md:flex-col gap-3 md:min-w-[200px] border-t md:border-t-0 md:border-l border-dashed border-border/60 pt-4 md:pt-0 md:pl-6 justify-center">
                                            <Button
                                                className="flex-1 w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-bold gap-2 h-12 shadow-lg shadow-black/10 transition-all hover:-translate-y-1"
                                                onClick={() => handleOpenChat(order.id, order.providerName || 'Provider')}
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                Chat with Provider
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="flex-1 w-full rounded-xl font-bold h-12 gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                            >
                                                <Info className="w-4 h-4" />
                                                Order Details
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {activeChatOrder && (
                <ChatDialog
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    orderId={activeChatOrder.id}
                    providerName={activeChatOrder.providerName}
                />
            )}
        </div>
    );
}
