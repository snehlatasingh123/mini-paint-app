import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  selectedTool: string = 'pencil';
  selectedColor: string = '#000000';
  pencilSize: number = 5;
  eraserSize: number = 10;
  drawing = false;

  @ViewChild('canvasRef', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d')!;
    this.ctx.lineWidth = this.pencilSize;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.selectedColor;
    this.setCanvasSize();
    this.setCursor('pencil'); // Default to pencil cursor
  }

  setCanvasSize() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    canvasEl.width = window.innerWidth - 200;
    canvasEl.height = window.innerHeight - 100;
  }

  setTool(tool: string) {
    this.selectedTool = tool;
    if (tool === 'eraser') {
      this.ctx.strokeStyle = '#FFFFFF'; // Eraser
      this.setCursor('eraser');
    } else if (tool === 'pencil') {
      this.ctx.strokeStyle = this.selectedColor;
      this.setCursor('pencil');
    } else {
      this.setCursor('default');
    }
  }

  setColor() {
    if (this.selectedTool !== 'eraser') {
      this.ctx.strokeStyle = this.selectedColor;
    }
  }

  setPencilSize() {
    this.ctx.lineWidth = this.pencilSize;
  }

  setEraserSize(size: number) {
    this.eraserSize = size;
    this.ctx.lineWidth = size;
  }

  setCursor(tool: string) {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    if (tool === 'pencil') {
      this.renderer.setStyle(
        canvasEl,
        'cursor',
        'url(data:image/svg+xml;base64,<<Base64_encoded_pencil_svg>>), auto'
      );
    } else if (tool === 'eraser') {
      this.renderer.setStyle(
        canvasEl,
        'cursor',
        'url(data:image/svg+xml;base64,<<Base64_encoded_eraser_svg>>), auto'
      );
    } else {
      this.renderer.setStyle(canvasEl, 'cursor', 'default');
    }
  }

  startDrawing(event: MouseEvent) {
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: MouseEvent) {
    if (!this.drawing) return;
    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
  }

  stopDrawing() {
    this.drawing = false;
    this.ctx.closePath();
  }

  resetCanvas() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    this.selectedTool = 'reset'; // Mark reset as selected
  }

  saveCanvas() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const link = document.createElement('a');
    link.download = 'artwork.png';
    link.href = canvasEl.toDataURL();
    link.click();
  }
}
