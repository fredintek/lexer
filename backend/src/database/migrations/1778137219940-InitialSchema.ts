import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778137219940 implements MigrationInterface {
    name = 'InitialSchema1778137219940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`stocks\` (\`symbol\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`sector\` varchar(255) NULL, \`industry\` varchar(255) NULL, \`description\` text NULL, \`website\` varchar(255) NULL, \`minLot\` decimal(18,2) NOT NULL DEFAULT '1.00', \`maxLot\` decimal(18,2) NOT NULL DEFAULT '0.00', \`lotStep\` decimal(18,2) NOT NULL DEFAULT '0.00', \`sellAdjustment\` decimal(18,4) NOT NULL DEFAULT '0.0000', \`buyAdjustment\` decimal(18,4) NOT NULL DEFAULT '0.0000', \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`symbol\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`color\` varchar(255) NOT NULL DEFAULT 'bg-brand', \`permissions\` text NULL, UNIQUE INDEX \`IDX_ae4578dcaed5adff96595e6166\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`login_history\` (\`id\` varchar(36) NOT NULL, \`ipAddress\` varchar(255) NOT NULL, \`browser\` varchar(255) NULL, \`os\` varchar(255) NULL, \`device\` varchar(255) NULL, \`wasSuccessful\` tinyint NOT NULL DEFAULT 1, \`loginAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh_tokens\` (\`id\` varchar(36) NOT NULL, \`token\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`expiresAt\` datetime NOT NULL, \`user_id\` varchar(36) NULL, \`login_history_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment_method\` (\`id\` varchar(36) NOT NULL, \`type\` enum ('Bank Account', 'Crypto Wallet') NOT NULL, \`name\` varchar(255) NOT NULL, \`detail\` varchar(255) NOT NULL, \`isDefault\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`bank_accounts\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`type\` enum ('BANK', 'CRYPTO') NOT NULL DEFAULT 'BANK', \`bankName\` varchar(255) NULL, \`accountHolder\` varchar(255) NULL, \`accountNumber\` varchar(255) NULL, \`routingSwift\` varchar(255) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`color\` varchar(255) NOT NULL DEFAULT 'bg-brand', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transaction\` (\`id\` varchar(36) NOT NULL, \`amount\` decimal(18,8) NOT NULL, \`type\` enum ('DEPOSIT', 'WITHDRAWAL') NOT NULL, \`status\` enum ('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING', \`adminNote\` varchar(255) NULL, \`receipt\` text NULL, \`expectedSettlementDate\` timestamp NULL, \`processedAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`paymentMethodId\` varchar(36) NULL, \`bankAccountId\` varchar(36) NULL, \`userId\` varchar(36) NULL, \`processedById\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification\` (\`id\` varchar(36) NOT NULL, \`type\` enum ('trade', 'wallet', 'security', 'system') NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`urgent\` tinyint NOT NULL DEFAULT 0, \`metadata\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`kyc\` (\`id\` varchar(36) NOT NULL, \`documentType\` varchar(255) NOT NULL, \`country\` varchar(255) NOT NULL, \`docData\` text NULL, \`selfieData\` text NULL, \`status\` enum ('PENDING', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'PENDING', \`rejectionReason\` varchar(255) NULL, \`reviewedById\` varchar(255) NULL, \`reviewedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, UNIQUE INDEX \`REL_ca948073ed4a3ba22030d37b3d\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`trade\` (\`id\` varchar(36) NOT NULL, \`symbol\` varchar(255) NOT NULL, \`side\` enum ('BUY', 'SELL') NOT NULL, \`quantity\` int NOT NULL, \`priceAtExecution\` decimal(18,2) NOT NULL, \`pnl\` decimal(18,2) NOT NULL DEFAULT '0.00', \`commission\` decimal(18,2) NOT NULL, \`status\` enum ('COMPLETED', 'CANCELLED', 'PENDING') NOT NULL DEFAULT 'PENDING', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`favorite\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(36) NULL, \`stockSymbol\` varchar(255) NULL, UNIQUE INDEX \`IDX_30fb4f17e1b46aa98c3cfcfa19\` (\`userId\`, \`stockSymbol\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`fullname\` varchar(30) NULL, \`tag\` varchar(255) NOT NULL, \`balance\` decimal(18,8) NOT NULL DEFAULT '0.00000000', \`frozenBalance\` decimal(18,8) NOT NULL DEFAULT '0.00000000', \`phoneNumber\` varchar(255) NULL, \`email\` varchar(225) NOT NULL, \`password\` varchar(225) NULL, \`status\` enum ('ACTIVE', 'SUSPENDED', 'PENDING', 'DEACTIVATED') NOT NULL DEFAULT 'ACTIVE', \`passwordResetToken\` varchar(225) NULL, \`passwordResetTokenExpiration\` timestamp NULL, \`isWelcomeEmailSent\` tinyint NOT NULL DEFAULT 0, \`avatar\` text NULL, \`tier\` int NOT NULL DEFAULT '1', \`fcmToken\` text NULL, \`pushEnabled\` tinyint NOT NULL DEFAULT 1, \`emailEnabled\` tinyint NOT NULL DEFAULT 1, \`changedPasswordAt\` timestamp NULL, \`isTwoFactorEnabled\` tinyint NOT NULL DEFAULT 0, \`mfaMethod\` enum ('TOTP', 'SMS', 'EMAIL') NULL, \`mfaSecret\` varchar(255) NULL, \`mfaOtpCode\` varchar(255) NULL, \`mfaOtpExpires\` timestamp NULL, \`isPhoneNumberVerified\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`role_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_7360583b3b97a10fb0d971bafd\` (\`tag\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`position\` (\`id\` varchar(36) NOT NULL, \`symbol\` varchar(255) NOT NULL, \`quantity\` int NOT NULL DEFAULT '0', \`averageEntryPrice\` decimal(18,2) NOT NULL DEFAULT '0.00', \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`settings\` (\`key\` varchar(255) NOT NULL, \`value\` text NOT NULL, \`group\` varchar(255) NOT NULL DEFAULT 'general', \`description\` varchar(255) NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`key\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_room\` (\`id\` varchar(36) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'OPEN', \`lastMessageAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, UNIQUE INDEX \`REL_e5e156f315f06303c004402b8c\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`message\` (\`id\` varchar(36) NOT NULL, \`senderId\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`isAdmin\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`roomId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`banner\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`image\` text NULL, \`link\` varchar(255) NULL, \`type\` enum ('hero', 'footer') NOT NULL DEFAULT 'hero', \`order\` int NOT NULL DEFAULT '0', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`activities\` (\`id\` varchar(36) NOT NULL, \`type\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`metadata\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`login_history\` ADD CONSTRAINT \`FK_ad9ce49cb73c0b33746a56b6bd1\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_3ddc983c5f7bcf132fd8732c3f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_8b335d6a495c0aee44235369167\` FOREIGN KEY (\`login_history_id\`) REFERENCES \`login_history\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_method\` ADD CONSTRAINT \`FK_34a4419ef2010224d7ff600659d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_406318e2ddca3828d340ec9151f\` FOREIGN KEY (\`paymentMethodId\`) REFERENCES \`payment_method\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_07540dda5970c29494e0f70f89e\` FOREIGN KEY (\`bankAccountId\`) REFERENCES \`bank_accounts\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_605baeb040ff0fae995404cea37\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_8b67dde35c27a41bd8fe049821f\` FOREIGN KEY (\`processedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_1ced25315eb974b73391fb1c81b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`kyc\` ADD CONSTRAINT \`FK_ca948073ed4a3ba22030d37b3db\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`kyc\` ADD CONSTRAINT \`FK_460f24691d7f582c4b465861782\` FOREIGN KEY (\`reviewedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trade\` ADD CONSTRAINT \`FK_0d9b88d57ac68cb76e7b4ec346a\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`favorite\` ADD CONSTRAINT \`FK_83b775fdebbe24c29b2b5831f2d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`favorite\` ADD CONSTRAINT \`FK_ba9b2280245a8830bcf0abd566f\` FOREIGN KEY (\`stockSymbol\`) REFERENCES \`stocks\`(\`symbol\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`position\` ADD CONSTRAINT \`FK_039f90c019013ef5d8d032f32f1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_room\` ADD CONSTRAINT \`FK_e5e156f315f06303c004402b8cb\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_fdfe54a21d1542c564384b74d5c\` FOREIGN KEY (\`roomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activities\` ADD CONSTRAINT \`FK_5a2cfe6f705df945b20c1b22c71\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activities\` DROP FOREIGN KEY \`FK_5a2cfe6f705df945b20c1b22c71\``);
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_fdfe54a21d1542c564384b74d5c\``);
        await queryRunner.query(`ALTER TABLE \`chat_room\` DROP FOREIGN KEY \`FK_e5e156f315f06303c004402b8cb\``);
        await queryRunner.query(`ALTER TABLE \`position\` DROP FOREIGN KEY \`FK_039f90c019013ef5d8d032f32f1\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_fb2e442d14add3cefbdf33c4561\``);
        await queryRunner.query(`ALTER TABLE \`favorite\` DROP FOREIGN KEY \`FK_ba9b2280245a8830bcf0abd566f\``);
        await queryRunner.query(`ALTER TABLE \`favorite\` DROP FOREIGN KEY \`FK_83b775fdebbe24c29b2b5831f2d\``);
        await queryRunner.query(`ALTER TABLE \`trade\` DROP FOREIGN KEY \`FK_0d9b88d57ac68cb76e7b4ec346a\``);
        await queryRunner.query(`ALTER TABLE \`kyc\` DROP FOREIGN KEY \`FK_460f24691d7f582c4b465861782\``);
        await queryRunner.query(`ALTER TABLE \`kyc\` DROP FOREIGN KEY \`FK_ca948073ed4a3ba22030d37b3db\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_1ced25315eb974b73391fb1c81b\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_8b67dde35c27a41bd8fe049821f\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_605baeb040ff0fae995404cea37\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_07540dda5970c29494e0f70f89e\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_406318e2ddca3828d340ec9151f\``);
        await queryRunner.query(`ALTER TABLE \`payment_method\` DROP FOREIGN KEY \`FK_34a4419ef2010224d7ff600659d\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_8b335d6a495c0aee44235369167\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_3ddc983c5f7bcf132fd8732c3f4\``);
        await queryRunner.query(`ALTER TABLE \`login_history\` DROP FOREIGN KEY \`FK_ad9ce49cb73c0b33746a56b6bd1\``);
        await queryRunner.query(`DROP TABLE \`activities\``);
        await queryRunner.query(`DROP TABLE \`banner\``);
        await queryRunner.query(`DROP TABLE \`message\``);
        await queryRunner.query(`DROP INDEX \`REL_e5e156f315f06303c004402b8c\` ON \`chat_room\``);
        await queryRunner.query(`DROP TABLE \`chat_room\``);
        await queryRunner.query(`DROP TABLE \`settings\``);
        await queryRunner.query(`DROP TABLE \`position\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_7360583b3b97a10fb0d971bafd\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_30fb4f17e1b46aa98c3cfcfa19\` ON \`favorite\``);
        await queryRunner.query(`DROP TABLE \`favorite\``);
        await queryRunner.query(`DROP TABLE \`trade\``);
        await queryRunner.query(`DROP INDEX \`REL_ca948073ed4a3ba22030d37b3d\` ON \`kyc\``);
        await queryRunner.query(`DROP TABLE \`kyc\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP TABLE \`transaction\``);
        await queryRunner.query(`DROP TABLE \`bank_accounts\``);
        await queryRunner.query(`DROP TABLE \`payment_method\``);
        await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`login_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_ae4578dcaed5adff96595e6166\` ON \`role\``);
        await queryRunner.query(`DROP TABLE \`role\``);
        await queryRunner.query(`DROP TABLE \`stocks\``);
    }

}
