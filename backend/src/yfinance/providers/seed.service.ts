import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';
import * as _ from 'lodash';
import { Stocks } from '../entities/stocks.entity';
import { BLACKLISTED_SYMBOLS, TURKISH_STOCKS } from 'src/lib/constants';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Stocks)
    private readonly stocksRepo: Repository<Stocks>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting Stocks Metadata Seeding...');
    await this.seedStocks();
  }

  private async seedStocks() {
    const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

    // 1. Identify which stocks are missing from the DB
    const existingStocks = await this.stocksRepo.find({ select: ['symbol'] });
    const existingSymbols = new Set(existingStocks.map((s) => s.symbol));

    const missingTickers = TURKISH_STOCKS.filter(
      (symbol) =>
        !existingSymbols.has(symbol) && !BLACKLISTED_SYMBOLS.includes(symbol),
    );

    if (missingTickers.length === 0) {
      this.logger.log('All stock metadata is already up to date.');
      return;
    }

    this.logger.log(
      `Fetching metadata for ${missingTickers.length} new stocks...`,
    );

    // 2. Process in small chunks to avoid Yahoo rate limits
    const chunks = _.chunk(missingTickers, 5);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (symbol) => {
          try {
            const ticker = `${symbol}`;
            const summary = await yf.quoteSummary(ticker, {
              modules: ['assetProfile', 'price'],
            });

            const stock = this.stocksRepo.create({
              symbol: symbol,
              name:
                summary.price?.longName || summary.price?.shortName || symbol,
              sector: summary.assetProfile?.sector,
              industry: summary.assetProfile?.industry,
              description: summary.assetProfile?.longBusinessSummary,
              website: summary.assetProfile?.website,
            });

            await this.stocksRepo.save(stock);
            this.logger.log(`Successfully seeded: ${symbol}`);
          } catch (error: any) {
            this.logger.error(
              `Failed to fetch metadata for ${symbol}: ${error.message}`,
            );
          }
        }),
      );

      // Small delay between chunks to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.log('Stock seeding completed.');
  }
}
