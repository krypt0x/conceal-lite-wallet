// Angular Core
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

// Services
import { HelperService } from './../../shared/services/helper.service';

// 3rd Party
import { ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity:0}),
          animate(800, style({opacity:1}))
        ])
      ]
    ),
		trigger('stagger', [
			transition(':enter', [
				query('#cards, .title', style({ opacity: 0, transform: 'translateX(-80px)' }), {optional: true}),
				query('#cards, .title', stagger('200ms', [
					animate('400ms 0.25s ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
				]), {optional: true}),
				query('#cards', [
					animate(1000, style('*'))
				], {optional: true})
			])
		])
  ]
})
export class DashboardComponent implements OnInit {

	constructor(
		public matIconRegistry: MatIconRegistry,
		public domSanitizer: DomSanitizer,
		private helperService: HelperService,
	) {
		matIconRegistry.addSvgIconSet(
			domSanitizer.bypassSecurityTrustResourceUrl(
				`assets/fonts/materal-icons-twotone.svg`
			)
		);
	}

	ngOnInit(): void {
		this.helperService.getMarket();
		this.helperService.getWallets();
		this.helperService.getPrices();
	}

	lineChartType = 'line';
	lineChartLabels: Label[] = this.helperService.marketLabels;
	lineChartColors: Color[] = [{
		backgroundColor: 'rgba(255, 165, 0, 0.3)',
		borderColor: 'rgb(255, 165, 0)',
	}, ];
	lineChartData: ChartDataSets[] = [{
		data: this.helperService.marketData,
		label: 'Price',
		fill: true,
		backgroundColor: 'rgba(255, 165, 0, 0.2)',
		borderColor: 'rgb(255, 165, 0)',
		borderWidth: 2,
		pointRadius: 0,
	}, ];
	lineChartOptions = {
		responsive: true,
		animation: false,
		maintainAspectRatio: false,
		layout: {
			padding: {
				left: 25,
				right: 0,
				top: 20,
				bottom: 0
			}
		},
		legend: {
			display: false,
		},
		scales: {
			yAxes: [{
				ticks: {
					padding: 5,
					maxTicksLimit: 5,
					fontSize: 12,
					fontColor: 'rgb(220, 220, 220)',
					callback: amount => `${this.helperService.formattedStringAmount(amount, null, '$')}`
				},
				gridLines: {
					color: 'rgba(255, 255, 255, .08)'
				},
			}],
			xAxes: [{
				ticks: {
					autoSkip: true,
					maxTicksLimit: 7,
					maxRotation: 0,
					minRotation: 0,
					padding: 5,
					fontSize: 12,
					fontColor: 'rgb(100,100,100)',
				},
				gridLines: {
					color: 'rgba(255, 255, 255, .08)',
				},
			}],
		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		tooltips: {
			mode: 'index',
			borderColor: 'rgba(255, 165, 0, 0.8)',
			borderWidth: 1,
			intersect: false,
			callbacks: {
				label: item => `${this.helperService.formattedStringAmount(item.value, '(USD)', '$')}`
			}
		},
	};

}
