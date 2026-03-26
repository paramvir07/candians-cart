'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import Link from 'next/link'

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

export default function FAQsThree() {
const faqItems: FAQItem[] = [
    {
        id: 'item-1',
        icon: 'mail',
        question: 'How do I get access to Candian\'s Cart?',
        answer: 'Candian\'s Cart is an invite-only platform. You\'ll need a referral from an existing member or a direct invite from our team. Once invited, you can sign up at no cost and get connected to your nearest local store right away.',
    },
    {
        id: 'item-2',
        icon: 'percent',
        question: 'How does subsidised pricing work?',
        answer: 'When you join, eligible grocery items at your local partner store are automatically discounted at checkout through our subsidy program. Your monthly subsidy balance is tracked in real-time as you shop — no coupon codes or manual claims needed.',
    },
    {
        id: 'item-3',
        icon: 'wallet',
        question: 'What is the Gift Wallet and how do I earn credits?',
        answer: 'The Gift Wallet is your personal rewards balance inside Candian\'s Cart. You earn credits automatically with every order you place. Credits accumulate over time and can be spent on any item available in your connected store — there\'s no minimum redemption amount.',
    },
    {
        id: 'item-4',
        icon: 'store',
        question: 'Which store will I be connected to?',
        answer: 'When you join, our platform automatically pairs you with the closest participating local store in your area. You\'ll be able to browse their live inventory, see which items are subsidised, and place orders directly through the app.',
    },
    {
        id: 'item-5',
        icon: 'shield-check',
        question: 'Is Candian\'s Cart available to everyone?',
        answer: 'Candian\'s Cart is currently exclusive to families who receive an invite. This keeps the platform community-driven and ensures every member gets a high-quality, personalised experience. If you\'re interested in joining, reach out to an existing member or contact us to get on the waitlist.',
    },
]

    return (
        <section className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground mt-4">
                                Can't find what you're looking for? Contact our{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    customer support team
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="bg-background shadow-xs rounded-lg border px-4 last:border-b">
                                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-6">
                                                <DynamicIcon
                                                    name={item.icon}
                                                    className="m-auto size-4"
                                                />
                                            </div>
                                            <span className="text-base">{item.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <div className="px-9">
                                            <p className="text-base">{item.answer}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}
