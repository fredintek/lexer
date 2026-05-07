import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TURKISH_STOCKS } from 'src/lib/constants';
import { Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';
import { Stocks } from '../entities/stocks.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateLotSettingsDto } from '../dtos';
import { Favorite } from '../entities/favoriteStock.entity';

@Injectable()
export class YfinanceService {
  constructor(
    @InjectRepository(Stocks)
    private readonly stockRepo: Repository<Stocks>,
    @InjectRepository(Favorite)
    private readonly favoriteStockRepo: Repository<Favorite>,
  ) {}

  public async getAllTurkishStocks() {
    try {
      // Map symbols to Yahoo format (SYMBOL.IS)
      const tickers = TURKISH_STOCKS;
      const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

      // Use yf.quote for multiple tickers to get updateLotSettingsDto in one call
      const results = await yf.quote(tickers);

      // Map back to a clean format for your frontend
      return results.map((stock) => ({
        ...stock,
        symbol: stock.symbol.replace('.IS', ''),
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch Turkish stocks list',
      );
    }
  }

  public async getStaticStocks() {
    try {
      const stocks = await this.stockRepo.find({
        order: {
          symbol: 'ASC',
        },
      });

      if (!stocks || stocks.length === 0) {
        console.warn('No static stocks found in the database.');
      }

      return stocks;
    } catch (error: any) {
      console.error(`Failed to fetch static stocks: ${error.message}`);
      throw new InternalServerErrorException(
        'Could not retrieve stock list from database',
      );
    }
  }

  public async getStaticStock(symbol: string) {
    try {
      const stock = await this.stockRepo.findOne({
        where: {
          symbol,
        },
      });

      if (!stock) {
        throw new NotFoundException('Stock not found');
      }

      return stock;
    } catch (error: any) {
      console.error(`Failed to fetch static stocks: ${error.message}`);
      throw new InternalServerErrorException(
        'Could not retrieve stock list from database',
      );
    }
  }

  public async getStockQuote(symbol: string) {
    try {
      const ticker = `${symbol}.IS`;
      const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
      return await yf.quote(ticker);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch quote for ${symbol}`,
      );
    }
  }

  /**
   * Fetches full profile, stats, and price info
   */
  public async getStockDetails(symbol: string) {
    try {
      const ticker = `${symbol}.IS`;
      // We request specific modules to get a complete picture like your Python script
      const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
      const result = await yf.quoteSummary(ticker, {
        modules: [
          'assetProfile',
          'price',
          'defaultKeyStatistics',
          'financialData',
        ],
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch details for ${symbol}`,
      );
    }
  }

  /**
   * Fetches historical data for the chart
   */
  public async getStockHistory(
    symbol: string,
    from: string,
    interval: any = '1d',
  ) {
    try {
      const ticker = `${symbol}.IS`;
      const yf = new YahooFinance({
        suppressNotices: ['ripHistorical', 'yahooSurvey'],
      });

      // 1. Ensure 'from' is a valid Date object
      const startDate = new Date(from);

      const queryOptions = {
        period1: startDate, // The library handles Date objects best
        interval: interval,
        // period2: new Date(), // Optional: defaults to now if omitted
      };

      const result = await yf.chart(ticker, queryOptions);

      // 2. Format the response to match your frontend expectation
      // yf.chart returns data inside a 'quotes' array
      return result.quotes.map((quote) => ({
        date: quote.date,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume,
      }));
    } catch (error) {
      console.error('Yahoo Chart Error:', error);
      throw new InternalServerErrorException(
        `Failed to fetch history for ${symbol}`,
      );
    }
  }

  /**
   * Fetches the latest news for a specific symbol
   */
  public async getStockNews(symbol: string) {
    try {
      const ticker = `${symbol}.IS`;
      const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

      const result = await yf.search(ticker);

      return result?.news;
    } catch (error) {
      console.error('Yahoo News Error:', error);
      throw new InternalServerErrorException(
        `Failed to fetch news for ${symbol}`,
      );
    }
  }

  public async getLiveMarkets(tempStocks?: string[]) {
    try {
      const tickers =
        tempStocks && tempStocks?.length > 0 ? tempStocks : TURKISH_STOCKS;
      const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

      // 2. Fetch live quotes for all symbols in one request
      const results = await yf.quote(tickers);

      // 3. Map to match your sidebar's expected shape
      return results.map((stock) => ({
        symbol: stock.symbol.replace('.IS', ''),
        price: stock.regularMarketPrice,
        change: stock.regularMarketChangePercent,
        volume: stock.regularMarketVolume,
      }));
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        'Failed to fetch live market data',
      );
    }
  }

  public async updateLotSettings(
    symbol: string,
    updateLotSettingsDto: UpdateLotSettingsDto,
  ) {
    const stock = await this.stockRepo.findOne({ where: { symbol } });
    if (!stock) throw new NotFoundException('Stock not found');

    if (
      updateLotSettingsDto.minLot &&
      updateLotSettingsDto.maxLot &&
      updateLotSettingsDto.minLot > updateLotSettingsDto.maxLot
    ) {
      throw new BadRequestException(
        'Minimum lot cannot be greater than maximum lot',
      );
    }

    stock.minLot = updateLotSettingsDto.minLot ?? stock.minLot;
    stock.maxLot = updateLotSettingsDto.maxLot ?? stock.maxLot;
    stock.lotStep = updateLotSettingsDto.lotStep ?? stock.lotStep;

    return await this.stockRepo.save(stock);
  }

  public async updateStockAdjustments(
    symbol: string,
    dto: { buyAdj: number; sellAdj: number },
  ) {
    const stock = await this.stockRepo.findOne({ where: { symbol } });

    if (!stock) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    // Update the specific adjustment fields
    stock.buyAdjustment = dto.buyAdj;
    stock.sellAdjustment = dto.sellAdj;

    return await this.stockRepo.save(stock);
  }

  public async toggleFavorite(userId: string, symbol: string) {
    const favorite = await this.favoriteStockRepo.findOne({
      where: { user: { id: userId }, stock: { symbol: `${symbol}.IS` } },
    });

    if (favorite) {
      await this.favoriteStockRepo.remove(favorite);
      return { isFavorite: false };
    }

    const stock = await this.getStaticStock(`${symbol}.IS`);

    if (!stock) throw new BadRequestException('Issue with stock');
    const newFavorite = this.favoriteStockRepo.create({
      user: { id: userId } as any,
      stock,
    });
    await this.favoriteStockRepo.save(newFavorite);
    return { isFavorite: true };
  }

  public async getUserFavorites(userId: string) {
    const favorites = await this.favoriteStockRepo.find({
      where: { user: { id: userId } },
      relations: ['stock'],
    });
    return favorites.map((f) => f.stock.symbol);
  }
}
