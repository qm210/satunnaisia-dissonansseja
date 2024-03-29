"""forgot comment column for ratings

Revision ID: 166d71a05bcd
Revises: a2735767b291
Create Date: 2024-02-09 01:02:47.983022

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '166d71a05bcd'
down_revision = 'a2735767b291'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('ratings', schema=None) as batch_op:
        batch_op.add_column(sa.Column('comment', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('ratings', schema=None) as batch_op:
        batch_op.drop_column('comment')

    # ### end Alembic commands ###
