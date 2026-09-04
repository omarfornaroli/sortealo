"use client";

import * as React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';



import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Dynamically import ReactQuill to prevent SSR window/document issues in Next.js
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function EmailTemplatesAdmin() {
  const [templates, setTemplates] = useState({
    winnerEmailSubject: '',
    winnerEmailBody: '',
    purchaseEmailSubject: '',
    purchaseEmailBody: ''
  });

  const defaultWinnerSubject = '¡Felicidades, {{name}}! Has ganado en {{raffleName}}';
  const defaultWinnerBody = '<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 30px; background-color: #ffffff;"><h1 style="color: #2563eb;">¡Felicidades, {{name}}!</h1><p>Has ganado el sorteo <strong>{{raffleName}}</strong> con el ticket <strong>{{winnerTicket}}</strong>.</p></div>';
  const defaultPurchaseSubject = 'Tus números para el sorteo: {{raffleName}}';
  const defaultPurchaseBody = '<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 30px; background-color: #ffffff;"><h1 style="color: #2563eb;">¡Mucha suerte, {{name}}!</h1><p>Has adquirido {{quantity}} chances.</p><div>{{ticketsHtml}}</div></div>';

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'winner' | 'purchase'>('winner');
  const router = useRouter();

  const [showSourceWinner, setShowSourceWinner] = useState(false);
  const [showSourcePurchase, setShowSourcePurchase] = useState(false);

  const winnerQuillRef = useRef<any>(null);
  const purchaseQuillRef = useRef<any>(null);

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  useEffect(() => {
    fetch('/api/admin/email-templates')
      .then(res => res.json())
      .then(data => {
        const updated = {
          winnerEmailSubject: data.winnerEmailSubject || defaultWinnerSubject,
          winnerEmailBody: data.winnerEmailBody || defaultWinnerBody,
          purchaseEmailSubject: data.purchaseEmailSubject || defaultPurchaseSubject,
          purchaseEmailBody: data.purchaseEmailBody || defaultPurchaseBody
        };
        setTemplates(updated);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading templates', err);
        setTemplates({
          winnerEmailSubject: defaultWinnerSubject,
          winnerEmailBody: defaultWinnerBody,
          purchaseEmailSubject: defaultPurchaseSubject,
          purchaseEmailBody: defaultPurchaseBody
        });
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplates(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      winnerEmailSubject: templates.winnerEmailSubject || defaultWinnerSubject,
      winnerEmailBody: templates.winnerEmailBody || defaultWinnerBody,
      purchaseEmailSubject: templates.purchaseEmailSubject || defaultPurchaseSubject,
      purchaseEmailBody: templates.purchaseEmailBody || defaultPurchaseBody
    };
    await fetch('/api/admin/email-templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setLoading(false);
    alert('Plantillas actualizadas');
    router.refresh();
  };

  const insertVariable = (varName: string, quillRef: React.RefObject<any>, field: 'winnerEmailBody' | 'purchaseEmailBody') => {
    const placeholder = `{{${varName}}}`;
    if (quillRef.current) {
      try {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true);
        const index = range ? range.index : editor.getLength();
        editor.insertText(index, placeholder);
        editor.setSelection(index + placeholder.length);
        return;
      } catch (err) {
        console.error('Error inserting variable into Quill editor', err);
      }
    }
    setTemplates(prev => ({
      ...prev,
      [field]: (prev[field] || '') + placeholder
    }));
  };

  if (loading) return <div className="p-8 text-center font-medium">Cargando...</div>;

  return (
    <div className="container mx-auto py-12 px-6 max-w-5xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-primary mb-10 uppercase tracking-widest transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Volver al Dashboard
      </Link>
      <Card className="max-w-4xl mx-auto p-6">
        <CardHeader>
          <CardTitle>Editar Plantillas de Email</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'winner' | 'purchase')} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="winner">Ganador</TabsTrigger>
              <TabsTrigger value="purchase">Compra</TabsTrigger>
            </TabsList>
            <TabsContent value="winner" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-medium mb-1" htmlFor="winnerEmailSubject">Asunto Ganador</label>
                  <Input
                    id="winnerEmailSubject"
                    name="winnerEmailSubject"
                    value={templates.winnerEmailSubject || defaultWinnerSubject}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1" htmlFor="winnerEmailBody">Cuerpo Ganador (HTML)</label>
                  {showSourceWinner ? (
                    <textarea
                      id="winnerEmailBody"
                      name="winnerEmailBody"
                      value={templates.winnerEmailBody || defaultWinnerBody}
                      onChange={handleChange}
                      rows={12}
                      className="border rounded p-2 w-full font-mono text-sm bg-background"
                    />
                  ) : (
                    <div
                      onDrop={(e: React.DragEvent) => {
                        e.preventDefault();
                        const varName = e.dataTransfer.getData('text/plain');
                        if (varName) insertVariable(varName, winnerQuillRef, 'winnerEmailBody');
                      }}
                      onDragOver={(e: React.DragEvent) => e.preventDefault()}
                      className="bg-white text-black rounded-md border overflow-hidden"
                    >
                      <ReactQuill
                        ref={winnerQuillRef as any}
                        theme="snow"
                        value={templates.winnerEmailBody}
                        onChange={(content) => setTemplates(prev => ({ ...prev, winnerEmailBody: content }))}
                        modules={modules}
                        formats={formats}
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => setShowSourceWinner(prev => !prev)}
                  >
                    {showSourceWinner ? 'Rich Text' : 'HTML Source'}
                  </Button>
                </div>
                <Button type="submit" variant="default" className="w-full">
                  Guardar Cambios
                </Button>
                <Button
                  type="button"
                  onClick={() => setTemplates(prev => ({
                    ...prev,
                    winnerEmailSubject: defaultWinnerSubject,
                    winnerEmailBody: defaultWinnerBody
                  }))}
                  variant="outline"
                  className="w-full"
                >
                  Restaurar a valores por defecto (Ganador)
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="purchase" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-medium mb-1" htmlFor="purchaseEmailSubject">Asunto Compra</label>
                  <Input
                    id="purchaseEmailSubject"
                    name="purchaseEmailSubject"
                    value={templates.purchaseEmailSubject || defaultPurchaseSubject}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1" htmlFor="purchaseEmailBody">Cuerpo Compra (HTML)</label>
                  {showSourcePurchase ? (
                    <textarea
                      id="purchaseEmailBody"
                      name="purchaseEmailBody"
                      value={templates.purchaseEmailBody || defaultPurchaseBody}
                      onChange={handleChange}
                      rows={12}
                      className="border rounded p-2 w-full font-mono text-sm bg-background"
                    />
                  ) : (
                    <div
                      onDrop={(e: React.DragEvent) => {
                        e.preventDefault();
                        const varName = e.dataTransfer.getData('text/plain');
                        if (varName) insertVariable(varName, purchaseQuillRef, 'purchaseEmailBody');
                      }}
                      onDragOver={(e: React.DragEvent) => e.preventDefault()}
                      className="bg-white text-black rounded-md border overflow-hidden"
                    >
                      <ReactQuill
                        ref={purchaseQuillRef as any}
                        theme="snow"
                        value={templates.purchaseEmailBody}
                        onChange={(content) => setTemplates(prev => ({ ...prev, purchaseEmailBody: content }))}
                        modules={modules}
                        formats={formats}
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => setShowSourcePurchase(prev => !prev)}
                  >
                    {showSourcePurchase ? 'Rich Text' : 'HTML Source'}
                  </Button>
                </div>
                <Button type="submit" variant="default" className="w-full">
                  Guardar Cambios
                </Button>
                <Button
                  type="button"
                  onClick={() => setTemplates(prev => ({
                    ...prev,
                    purchaseEmailSubject: defaultPurchaseSubject,
                    purchaseEmailBody: defaultPurchaseBody
                  }))}
                  variant="outline"
                  className="w-full"
                >
                  Restaurar a valores por defecto (Compra)
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Variables disponibles</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Haz clic o arrastra una variable dentro del editor para insertarla.
            </p>
            <div className="flex flex-wrap gap-2">
              {['name', 'quantity', 'raffleName', 'ticketsHtml', 'winnerTicket', 'winnerEmail'].map(v => (
                <Badge
                  key={v}
                  draggable
                  onClick={() => {
                    if (activeTab === 'winner') {
                      insertVariable(v, winnerQuillRef, 'winnerEmailBody');
                    } else {
                      insertVariable(v, purchaseQuillRef, 'purchaseEmailBody');
                    }
                  }}
                  onDragStart={e => {
                    e.dataTransfer.setData('text/plain', v);
                    const dragImg = document.createElement('div');
                    dragImg.style.position = 'absolute';
                    dragImg.style.padding = '4px 8px';
                    dragImg.style.background = '#f3f4f6';
                    dragImg.style.border = '1px solid #d1d5db';
                    dragImg.style.borderRadius = '4px';
                    dragImg.style.fontSize = '12px';
                    dragImg.style.color = '#111';
                    dragImg.textContent = `{{${v}}}`;
                    document.body.appendChild(dragImg);
                    e.dataTransfer.setDragImage(dragImg, 0, 0);
                    setTimeout(() => {
                      if (document.body.contains(dragImg)) {
                        document.body.removeChild(dragImg);
                      }
                    }, 0);
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >{`{{${v}}}`}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
