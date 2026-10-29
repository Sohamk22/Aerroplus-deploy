'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  MapPin,
  Activity,
  AlertCircle
} from 'lucide-react';
import { ChatMessage, LiveAQIResponse } from '@/lib/types';
import { SUGGESTED_QUESTIONS } from '@/lib/presets';
import { FormattedMessage, CleanInline } from '@/components/FormattedMessage';

interface AssistantViewProps {
  aqiData: LiveAQIResponse | null;
  currentCity: string;
  onSelectCityClick: () => void;
  onNavigateToTab: (tab: 'airquality' | 'insights') => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  aqiData,
  currentCity,
  onSelectCityClick,
  onNavigateToTab
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          timestamp: 'Just now',
          structuredAnswer: {
            intent: 'WELCOME',
            headerTitle: `🌿 Welcome! I am your AeroPlus Guide for ${currentCity}`,
            summary: `I'm here to help you navigate air quality and health in ${currentCity}! 😊 Ask me about morning runs, masks, outdoor plans, or local clean-air measures.`,
            mainContent: `Feel free to ask me anything about the air today, or tap any of the popular questions below to get started!`,
            citations: [
              {
                docName: 'CAQM_Act_2021.pdf',
                docTitle: 'Commission for Air Quality Management (CAQM) Act 2021',
                pageNumber: 1,
                authority: 'Ministry of Law & Justice',
                excerpt: 'Statutory authority regulating air pollution and coordinating multi-state mitigation measures.',
                relevanceNote: 'Empowers official air quality guidelines'
              }
            ],
            caveats: [
              'Health guidance is informative and grounded in verified environmental observations.'
            ],
            suggestedFollowups: [
              "What's the current AQI in Delhi?",
              "Is it safe to go outside today?",
              "Should I wear an N95 mask?",
              "What measures are authorities taking under GRAP?"
            ],
            aqiSnapshot: aqiData ? {
              location: aqiData.location.name,
              aqi: aqiData.aqi,
              category: aqiData.category,
              dominantPollutant: aqiData.dominant_pollutant
            } : undefined
          }
        }
      ]);
    }
  }, [currentCity, aqiData]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text
      }
    ];

    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          location: currentCity,
          aqi: aqiData?.aqi || 146,
          category: aqiData?.category || 'Unhealthy for Sensitive Groups',
          dominantPollutant: aqiData?.dominant_pollutant || 'PM2.5',
          weatherSummary: aqiData?.weather
            ? `Temp ${aqiData.weather.temperature}°C, Humidity ${aqiData.weather.humidity}%, Wind ${aqiData.weather.windSpeed} km/h (${aqiData.weather.stagnationRisk} stagnation)`
            : ''
        })
      });

      if (!res.ok) {
        throw new Error(`Chat API error (${res.status})`);
      }

      const data = await res.json();
      const assistantMessageId = `asst-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structuredAnswer: data.answer
        }
      ]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: 'I encountered a temporary connection issue. Please check your internet or retry.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCitation = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] pb-24">
      {/* City Status Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="text-slate-500">Context:</span>
            <button
              onClick={onSelectCityClick}
              className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-brand-700 transition-colors"
            >
              <span>{currentCity}</span>
              <MapPin className="w-3 h-3 text-brand-600" />
            </button>
            {aqiData && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white ml-1 shadow-2xs"
                style={{ backgroundColor: aqiData.badge_color }}
              >
                AQI {aqiData.aqi} · {aqiData.category}
              </span>
            )}
          </div>

          <button
            onClick={() => onNavigateToTab('airquality')}
            className="text-brand-700 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Telemetry</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Suggested Questions Carousel / Quick Chips */}
      <div className="bg-slate-50/70 border-b border-slate-200/60 py-2.5 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase shrink-0">
            SUGGESTED:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 text-xs font-medium transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-4">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end animate-fade-in">
                <div className="max-w-[85%] rounded-2xl rounded-tr-none px-4 py-2.5 chat-bubble-user text-xs sm:text-sm font-medium shadow-sm">
                  {msg.text}
                </div>
              </div>
            );
          }

          // Assistant Message
          const ans = msg.structuredAnswer;
          const isCitationOpen = !!expandedCitations[msg.id];
          const isWelcomeMsg = msg.id === 'welcome-1';

          return (
            <div key={msg.id} className="flex gap-2.5 max-w-[95%] sm:max-w-[90%] animate-fade-in">
              {/* Bot Avatar */}
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>

              {/* Bot Bubble */}
              <div className="flex-1 rounded-2xl rounded-tl-none p-4 chat-bubble-assistant text-slate-800 text-xs sm:text-sm space-y-3">
                {msg.error ? (
                  <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{msg.error}</span>
                  </div>
                ) : ans ? (
                  <>
                    {/* Header with Intent */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                        {ans.intent.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      <CleanInline text={ans.headerTitle} />
                    </h4>

                    {/* Friendly Executive Summary Card */}
                    <div className="p-3 rounded-xl bg-emerald-50/80 border-l-4 border-emerald-600 text-emerald-950 text-xs sm:text-sm font-medium leading-relaxed">
                      <CleanInline text={ans.summary} />
                    </div>

                    {/* Main Content cleanly formatted */}
                    <div className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                      <FormattedMessage content={ans.mainContent} />
                    </div>

                    {/* Welcome Screen Interactive Question Cards */}
                    {isWelcomeMsg && (
                      <div className="pt-2 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Tap a question to ask:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SUGGESTED_QUESTIONS.slice(0, 4).map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSendMessage(q)}
                              disabled={isLoading}
                              className="text-left p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-brand-300 hover:bg-brand-50/70 text-slate-800 text-xs font-medium transition-all shadow-2xs active:scale-[0.98] flex items-center justify-between group"
                            >
                              <span className="line-clamp-2">{q}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-700 transition-colors shrink-0 ml-1.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Snapshot Card if present */}
                    {ans.aqiSnapshot && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-brand-700" />
                          <div>
                            <span className="text-slate-500">Location: </span>
                            <span className="font-bold text-slate-800">{ans.aqiSnapshot.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900">AQI {ans.aqiSnapshot.aqi}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                            {ans.aqiSnapshot.category}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Statutory Citations Accordion */}
                    {ans.citations && ans.citations.length > 0 && (
                      <div className="border-t border-slate-100 pt-2">
                        <button
                          onClick={() => toggleCitation(msg.id)}
                          className="flex items-center justify-between w-full py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                            <span>Statutory Policy Citations ({ans.citations.length})</span>
                          </span>
                          {isCitationOpen ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isCitationOpen && (
                          <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-brand-200">
                            {ans.citations.map((cite, cIdx) => (
                              <div key={cIdx} className="text-[11px] text-slate-600 space-y-0.5">
                                <div className="font-semibold text-slate-800">
                                  {cite.docTitle} {cite.pageNumber ? `(Page ${cite.pageNumber})` : ''}
                                </div>
                                <div className="text-[10px] text-brand-800 font-medium">{cite.authority}</div>
                                <div className="italic text-slate-500">&quot;{cite.excerpt}&quot;</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Follow-up Questions Chips */}
                    {!isWelcomeMsg && ans.suggestedFollowups && ans.suggestedFollowups.length > 0 && (
                      <div className="border-t border-slate-100 pt-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Related Inquiries
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ans.suggestedFollowups.map((followup, fIdx) => {
                            const cleanText = followup.replace(/[\*"]/g, '').trim();
                            return (
                              <button
                                key={fIdx}
                                onClick={() => handleSendMessage(cleanText)}
                                disabled={isLoading}
                                className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-brand-50 hover:text-brand-800 text-slate-700 transition-colors border border-slate-200/60 font-medium active:scale-95 disabled:opacity-50"
                              >
                                {cleanText}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div>{msg.text}</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 max-w-[85%] animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-none p-3.5 chat-bubble-assistant text-slate-600 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
              <span>AeroPlus AI is checking the forecast and advice for you...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating / Sticky Chat Input Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-2xl mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask about running, masks, health, or air in ${currentCity}...`}
            className="flex-1 py-2.5 px-4 bg-slate-100 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-brand-700 hover:bg-brand-800 active:scale-95 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
