import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactoredTransactionsDB1778737242898 implements MigrationInterface {
  name = 'RefactoredTransactionsDB1778737242898';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const dropIndexIfExists = async (table: string, index: string) => {
      const check = await queryRunner.query(`
            SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = '${table}' 
            AND INDEX_NAME = '${index}'
        `);
      if (check.length > 0) {
        await queryRunner.query(`DROP INDEX \`${index}\` ON \`${table}\``);
      }
    };

    const dropFKIfExists = async (table: string, fkName: string) => {
      const exists = await queryRunner.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = '${table}' 
      AND CONSTRAINT_NAME = '${fkName}'
    `);
      if (exists.length > 0) {
        await queryRunner.query(
          `ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fkName}\``,
        );
      }
    };
    await dropIndexIfExists('login_history', 'FK_ad9ce49cb73c0b33746a56b6bd1');

    await dropIndexIfExists('refresh_tokens', 'FK_3ddc983c5f7bcf132fd8732c3f4');
    await dropIndexIfExists('refresh_tokens', 'FK_8b335d6a495c0aee44235369167');
    await dropIndexIfExists('payment_method', 'FK_34a4419ef2010224d7ff600659d');
    await dropIndexIfExists('notification', 'FK_1ced25315eb974b73391fb1c81b');
    await dropIndexIfExists('kyc', 'FK_460f24691d7f582c4b465861782');
    await dropIndexIfExists('positions', 'FK_0cf2caecfba00a6746ec1ff87a3');

    await queryRunner.query(
      `CREATE TABLE \`transactions\` (\`id\` varchar(36) NOT NULL, \`type\` enum ('BUY_OPEN', 'BUY_WAITING', 'BUY_MERGE', 'SELL_FULL', 'SELL_PARTIAL', 'CANCEL', 'DEPOSIT', 'WITHDRAWAL') NOT NULL, \`symbol\` varchar(255) NOT NULL, \`lots\` decimal(18,4) NOT NULL, \`priceAtExecution\` decimal(18,4) NOT NULL, \`marginAmount\` decimal(18,2) NOT NULL, \`realizedPnL\` decimal(18,2) NOT NULL DEFAULT '0.00', \`commission\` decimal(18,2) NOT NULL DEFAULT '0.00', \`balanceBefore\` decimal(18,2) NOT NULL, \`balanceAfter\` decimal(18,2) NOT NULL, \`notes\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`method\` varchar(255) NULL, \`reference\` varchar(255) NULL, \`status\` enum ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED', \`adminNote\` varchar(255) NULL, \`userId\` varchar(36) NULL, \`positionId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`name\` \`name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`sector\` \`sector\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`industry\` \`industry\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`description\` \`description\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`website\` \`website\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role\` CHANGE \`permissions\` \`permissions\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`browser\` \`browser\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`os\` \`os\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`device\` \`device\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` CHANGE \`login_history_id\` \`login_history_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_method\` CHANGE \`userId\` \`userId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` CHANGE \`metadata\` \`metadata\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` CHANGE \`userId\` \`userId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`front\` \`front\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`back\` \`back\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`rejectionReason\` \`rejectionReason\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`reviewedById\` \`reviewedById\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`reviewedAt\` \`reviewedAt\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`userId\` \`userId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`exitPrice\` \`exitPrice\` decimal(18,4) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`realizedPnL\` \`realizedPnL\` decimal(18,2) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`status\` \`status\` enum ('waiting', 'open', 'closed', 'cancelled') NOT NULL DEFAULT 'waiting'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`displayLot\` \`displayLot\` decimal NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`displayCost\` \`displayCost\` decimal NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`closingDate\` \`closingDate\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`userId\` \`userId\` varchar(36) NULL`,
    );

    await dropFKIfExists('user', 'FK_fb2e442d14add3cefbdf33c4561');
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`fullname\` \`fullname\` varchar(30) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`identificationNumber\` \`identificationNumber\` varchar(11) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`password\` \`password\` varchar(225) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`passwordResetToken\` \`passwordResetToken\` varchar(225) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`passwordResetTokenExpiration\` \`passwordResetTokenExpiration\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`avatar\` \`avatar\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`fcmToken\` \`fcmToken\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`changedPasswordAt\` \`changedPasswordAt\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`mfaMethod\` \`mfaMethod\` enum ('TOTP', 'SMS', 'EMAIL') NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`mfaSecret\` \`mfaSecret\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`mfaOtpCode\` \`mfaOtpCode\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`mfaOtpExpires\` \`mfaOtpExpires\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`role_id\` \`role_id\` varchar(36) NULL`,
    );
    await dropFKIfExists('favorite', 'FK_83b775fdebbe24c29b2b5831f2d');
    await dropFKIfExists('favorite', 'FK_ba9b2280245a8830bcf0abd566f');

    await queryRunner.query(
      `DROP INDEX \`IDX_30fb4f17e1b46aa98c3cfcfa19\` ON \`favorite\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` CHANGE \`userId\` \`userId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` CHANGE \`stockSymbol\` \`stockSymbol\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`settings\` CHANGE \`description\` \`description\` varchar(255) NULL`,
    );
    await dropFKIfExists('chat_room', 'FK_e5e156f315f06303c004402b8cb');
    await dropFKIfExists('message', 'FK_fdfe54a21d1542c564384b74d5c');

    await queryRunner.query(
      `ALTER TABLE \`chat_room\` CHANGE \`userId\` \`userId\` varchar(36) NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`message\` CHANGE \`roomId\` \`roomId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`banner\` CHANGE \`image\` \`image\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`banner\` CHANGE \`link\` \`link\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank_accounts\` CHANGE \`bankName\` \`bankName\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank_accounts\` CHANGE \`accountHolder\` \`accountHolder\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank_accounts\` CHANGE \`accountNumber\` \`accountNumber\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank_accounts\` CHANGE \`routingSwift\` \`routingSwift\` varchar(255) NULL`,
    );
    await dropFKIfExists('activities', 'FK_5a2cfe6f705df945b20c1b22c71');

    await queryRunner.query(
      `ALTER TABLE \`activities\` CHANGE \`metadata\` \`metadata\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activities\` CHANGE \`userId\` \`userId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_30fb4f17e1b46aa98c3cfcfa19\` ON \`favorite\` (\`userId\`, \`stockSymbol\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` ADD CONSTRAINT \`FK_ad9ce49cb73c0b33746a56b6bd1\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_3ddc983c5f7bcf132fd8732c3f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_8b335d6a495c0aee44235369167\` FOREIGN KEY (\`login_history_id\`) REFERENCES \`login_history\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_method\` ADD CONSTRAINT \`FK_34a4419ef2010224d7ff600659d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_1ced25315eb974b73391fb1c81b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` ADD CONSTRAINT \`FK_ca948073ed4a3ba22030d37b3db\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` ADD CONSTRAINT \`FK_460f24691d7f582c4b465861782\` FOREIGN KEY (\`reviewedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` ADD CONSTRAINT \`FK_0cf2caecfba00a6746ec1ff87a3\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_6bb58f2b6e30cb51a6504599f41\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_26d3ddc08f3ca2799c6b5ac4d30\` FOREIGN KEY (\`positionId\`) REFERENCES \`positions\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` ADD CONSTRAINT \`FK_83b775fdebbe24c29b2b5831f2d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` ADD CONSTRAINT \`FK_ba9b2280245a8830bcf0abd566f\` FOREIGN KEY (\`stockSymbol\`) REFERENCES \`stocks\`(\`symbol\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_room\` ADD CONSTRAINT \`FK_e5e156f315f06303c004402b8cb\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`message\` ADD CONSTRAINT \`FK_fdfe54a21d1542c564384b74d5c\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activities\` ADD CONSTRAINT \`FK_5a2cfe6f705df945b20c1b22c71\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`activities\` DROP FOREIGN KEY \`FK_5a2cfe6f705df945b20c1b22c71\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_fdfe54a21d1542c564384b74d5c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_room\` DROP FOREIGN KEY \`FK_e5e156f315f06303c004402b8cb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` DROP FOREIGN KEY \`FK_ba9b2280245a8830bcf0abd566f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` DROP FOREIGN KEY \`FK_83b775fdebbe24c29b2b5831f2d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_fb2e442d14add3cefbdf33c4561\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_26d3ddc08f3ca2799c6b5ac4d30\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_6bb58f2b6e30cb51a6504599f41\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` DROP FOREIGN KEY \`FK_0cf2caecfba00a6746ec1ff87a3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` DROP FOREIGN KEY \`FK_460f24691d7f582c4b465861782\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` DROP FOREIGN KEY \`FK_ca948073ed4a3ba22030d37b3db\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_1ced25315eb974b73391fb1c81b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_method\` DROP FOREIGN KEY \`FK_34a4419ef2010224d7ff600659d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_8b335d6a495c0aee44235369167\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_3ddc983c5f7bcf132fd8732c3f4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` DROP FOREIGN KEY \`FK_ad9ce49cb73c0b33746a56b6bd1\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_30fb4f17e1b46aa98c3cfcfa19\` ON \`favorite\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`activities\` CHANGE \`userId\` \`userId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activities\` CHANGE \`metadata\` \`metadata\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`activities\` ADD CONSTRAINT \`FK_5a2cfe6f705df945b20c1b22c71\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank_accounts\` CHANGE \`routingSwift\` \`routingSwift\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank_accounts\` CHANGE \`accountNumber\` \`accountNumber\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank_accounts\` CHANGE \`accountHolder\` \`accountHolder\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank_accounts\` CHANGE \`bankName\` \`bankName\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`banner\` CHANGE \`link\` \`link\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`banner\` CHANGE \`image\` \`image\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`message\` CHANGE \`roomId\` \`roomId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`message\` ADD CONSTRAINT \`FK_fdfe54a21d1542c564384b74d5c\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_room\` CHANGE \`userId\` \`userId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chat_room\` ADD CONSTRAINT \`FK_e5e156f315f06303c004402b8cb\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`settings\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` CHANGE \`stockSymbol\` \`stockSymbol\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` CHANGE \`userId\` \`userId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_30fb4f17e1b46aa98c3cfcfa19\` ON \`favorite\` (\`userId\`, \`stockSymbol\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` ADD CONSTRAINT \`FK_ba9b2280245a8830bcf0abd566f\` FOREIGN KEY (\`stockSymbol\`) REFERENCES \`stocks\`(\`symbol\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`favorite\` ADD CONSTRAINT \`FK_83b775fdebbe24c29b2b5831f2d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`role_id\` \`role_id\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`mfaOtpExpires\` \`mfaOtpExpires\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`mfaOtpCode\` \`mfaOtpCode\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`mfaSecret\` \`mfaSecret\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`mfaMethod\` \`mfaMethod\` enum ('TOTP', 'SMS', 'EMAIL') NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`changedPasswordAt\` \`changedPasswordAt\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`fcmToken\` \`fcmToken\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`avatar\` \`avatar\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`passwordResetTokenExpiration\` \`passwordResetTokenExpiration\` timestamp NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`passwordResetToken\` \`passwordResetToken\` varchar(225) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`password\` \`password\` varchar(225) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`identificationNumber\` \`identificationNumber\` varchar(11) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`fullname\` \`fullname\` varchar(30) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`userId\` \`userId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`closingDate\` \`closingDate\` datetime NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`displayCost\` \`displayCost\` decimal(10,0) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`displayLot\` \`displayLot\` decimal(10,0) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`status\` \`status\` enum ('waiting', 'open', 'closed', 'cancellCANCELLED') NOT NULL DEFAULT ''waiting''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`realizedPnL\` \`realizedPnL\` decimal(18,2) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`positions\` CHANGE \`exitPrice\` \`exitPrice\` decimal(18,4) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`userId\` \`userId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`reviewedAt\` \`reviewedAt\` datetime NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`reviewedById\` \`reviewedById\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`rejectionReason\` \`rejectionReason\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`back\` \`back\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`kyc\` CHANGE \`front\` \`front\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` CHANGE \`userId\` \`userId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` CHANGE \`metadata\` \`metadata\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_method\` CHANGE \`userId\` \`userId\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` CHANGE \`login_history_id\` \`login_history_id\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_tokens\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`device\` \`device\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`os\` \`os\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_history\` CHANGE \`browser\` \`browser\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role\` CHANGE \`permissions\` \`permissions\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`website\` \`website\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`industry\` \`industry\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`sector\` \`sector\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stocks\` CHANGE \`name\` \`name\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(`DROP TABLE \`transactions\``);
    await queryRunner.query(
      `CREATE INDEX \`FK_0cf2caecfba00a6746ec1ff87a3\` ON \`positions\` (\`userId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`FK_460f24691d7f582c4b465861782\` ON \`kyc\` (\`reviewedById\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`FK_1ced25315eb974b73391fb1c81b\` ON \`notification\` (\`userId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`FK_34a4419ef2010224d7ff600659d\` ON \`payment_method\` (\`userId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`FK_8b335d6a495c0aee44235369167\` ON \`refresh_tokens\` (\`login_history_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`FK_3ddc983c5f7bcf132fd8732c3f4\` ON \`refresh_tokens\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`FK_ad9ce49cb73c0b33746a56b6bd1\` ON \`login_history\` (\`user_id\`)`,
    );
  }
}
